import { Centrifuge } from 'centrifuge';

import realtimeApi from '@/api/realtimeApi';
import logApi from '@/api/logApi';

const getToken = async (body = {}) => {
  const tokenInfo = await realtimeApi.getRealTimeToken(body);
  return tokenInfo;
};

class CentrifugeService {
  constructor(tenantId) {
    this.centrifuge = null;
    this.connectPromise = null;
    this.tenantId = tenantId;
    this.subscriptions = {
      station: null,
      factoryViewStations: {},
      rollingStations: {},
      newmessage: null,
      checklists: null,
      shiftUpdate: null,
      systemStatus: null,
    };
  }

  disconnect() {
    if (this.centrifuge) {
      this.centrifuge.disconnect();
      this.centrifuge = null;
      this.connectPromise = null;
    }
  }

  async connect(url, token, channels) {
    if (this.connectPromise) return this.connectPromise;
    this.connectPromise = new Promise((resolve) => {
      this.centrifuge = new Centrifuge(url, {
        getToken: async () => {
          const tokenInfo = await getToken(channels);
          return tokenInfo.token;
        },
        token,
        maxReconnectDelay: 120000,
        minReconnectDelay: 60000,
        debug: true,
      });

      this.centrifuge.on('error', (error) => {
        logApi.logCentrifugeEvent([{ type: 'connection error', message: JSON.stringify(error) }]);
      });

      this.centrifuge.on('connected', () => {
        resolve('successfully connected');
      });

      this.centrifuge.on('disconnected', () => {
        this.connectPromise = null;
      });

      this.centrifuge.connect();
    });
    return this.connectPromise;
  }

  async subscribe(channel, id, listener) {
    const idString = id ? `/${id}` : '';
    const channelName = `$${this.tenantId}${idString}/${channel}`;
    const { url, token } = await getToken();
    await this.connect(url, token);
    await this.unsubscribe(channel);
    const channelTokenInfo = await getToken({ channel: channelName });
    const subscription = this.centrifuge.newSubscription(channelName, {
      token: channelTokenInfo.token,
      getToken: async () => {
        const tokenInfo = await getToken({ channel: channelName });
        return tokenInfo.token;
      },
      minResubscribeDelay: 60000,
      maxResubscribeDelay: 120000,
    });

    this.subscriptions[channel] = subscription;

    subscription.on('publication', (message) => {
      listener(message.data);
      if (this.logEvents) {
        logApi.logCentrifugeEvent([{ type: 'publication', message: JSON.stringify(message.data) }]);
      }
    });

    subscription.on('error', (error) => {
      logApi.logCentrifugeEvent([{ type: 'centrifuge error', message: JSON.stringify(error) }]);
    });

    subscription.subscribe();
  }

  async unsubscribe(channel) {
    const subscription = this.subscriptions[channel];
    if (!subscription) return;
    await subscription.unsubscribe();
    subscription.removeAllListeners();
    this.centrifuge.removeSubscription(subscription);
    this.subscriptions[channel] = null;
  }

  async subscribeToFactoryViewStations(stationIds, stationsListener) {
    this.disconnect();
    this.subscriptions.factoryViewStations = {};
    const channels = stationIds.reduce((acc, stationId) => {
      acc.push(`$${this.tenantId}/${stationId}/factoryview`);
      return acc;
    }, []);

    const tokenInfo = await getToken({ channels });

    await this.connect(tokenInfo.url, tokenInfo.token, { channels });

    this.centrifuge.startBatching();

    channels.forEach(async (channel) => {
      const stationId = Number(channel.split('/')[1]);
      if (this.subscriptions.factoryViewStations[stationId]) return; // already subscribed
      const subscription = this.centrifuge.newSubscription(channel);
      subscription.on('publication', (message) => {
        stationsListener({
          type: 'setTimeline',
          data: message.data,
          station: stationId,
        });
      });
      subscription.subscribe();
      this.subscriptions.factoryViewStations[stationId] = subscription;
    });
    this.centrifuge.stopBatching();
  }

  unsubscribeFactoryViewStation(stationId) {
    const subscription = this.subscriptions.factoryViewStations[stationId];
    if (!subscription) return;
    subscription.unsubscribe();
    subscription.removeAllListeners();
    this.centrifuge.removeSubscription(subscription);
    delete this.subscriptions.factoryViewStations[stationId];
  }

  unsubscribeFactoryViewStations() {
    const stationIds = Object.keys(this.subscriptions.factoryViewStations);
    stationIds.forEach((stationId) => {
      this.unsubscribeFactoryViewStation(Number(stationId));
    });
    this.disconnect();
  }

  async connectToRollingStations(stationIds, interval = 8) {
    this.disconnectRollingStations();
    if (!stationIds || !interval) return;
    const channels = stationIds.reduce((acc, stationId) => {
      if (stationId in this.subscriptions.rollingStations) return acc;
      acc.push(`$${this.tenantId}/${stationId}/${interval}/rolling`);
      return acc;
    }, []);
    const { url, token } = await getToken({ channels });
    await this.connect(url, token, { channels });
  }

  async subscribeRollingStation(stationId, interval, stationsListener) {
    if (!this.connectPromise) {
      // connection not established, try again in 1s
      setTimeout(() => this.subscribeRollingStation(stationId, interval, stationsListener), 1000);
      return;
    }
    await this.connectPromise;
    this.unsubscribeRollingStation(stationId);
    const channel = `$${this.tenantId}/${stationId}/${interval}/rolling`;
    const subscription = this.centrifuge.newSubscription(channel);
    subscription.on('publication', (message) => {
      stationsListener({
        type: 'setTimeline',
        data: message.data,
        station: stationId,
      });
    });
    subscription.subscribe();
    this.subscriptions.rollingStations[stationId] = subscription;
  }

  unsubscribeRollingStation(stationId) {
    const subscription = this.subscriptions.rollingStations[stationId];
    if (!subscription) return;
    subscription.unsubscribe();
    subscription.removeAllListeners();
    this.centrifuge.removeSubscription(subscription);
    delete this.subscriptions.rollingStations[stationId];
  }

  disconnectRollingStations() {
    this.disconnect();
    this.subscriptions.rollingStations = {};
  }
}

export default CentrifugeService;
