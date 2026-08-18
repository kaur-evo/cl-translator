/* eslint-disable no-param-reassign */
/* eslint-disable sonarjs/concise-regex */
/* eslint-disable sonarjs/single-character-alternation */
import shiftviewDialogs from '@/constants/dialogConfigs';
import editScrapDialogConfig from '@/constants/shiftviewDialogConfigs/editScrapDialogConfig';
import {
  useShiftviewSelectionStore,
  useGenericDialogStore,
  useShiftviewTimelineStore,
  useShiftStore,
} from '@/stores/index';

export default class KeyListener {
  constructor(applyBarCodeComment, applyBarCodeSignalQty, postClientMetrics, applyBarCodeChangeover, applyBarCodeScrap, applyBarCodeScrapReason) {
    this.applyBarCodeComment = applyBarCodeComment;
    this.applyBarCodeSignalQty = applyBarCodeSignalQty;
    this.postClientMetrics = postClientMetrics;
    this.applyBarCodeChangeover = applyBarCodeChangeover;
    this.applyBarCodeScrap = applyBarCodeScrap;
    this.applyBarCodeScrapReason = applyBarCodeScrapReason;
    this.capitalLetterRegex = null;
    this.hashtagRegex = /(#shift|shift3)$/;

    this.listener = null;
    this.buffer = '';
    this.lastKeyTime = Date.now();
  }

  getLastUncommentedSlice() {
    const { timeline } = useShiftviewTimelineStore();
    for (let i = timeline.length - 1; i > 0; i -= 1) {
      const slice = timeline[i];
      if (slice.type === 'STOPPAGE' && slice.commentId === 0) {
        return slice;
      }
    }
    return null;
  }

  getLastProductCircle() {
    const { timeline } = useShiftviewTimelineStore();
    for (let i = timeline.length - 1; i > 0; i -= 1) {
      const slice = timeline[i];
      if (slice.type === 'PRODUCT' && slice.batchId !== -1 && !slice.isFake) {
        return slice;
      }
    }
    return {};
  }

  removeEventListener() {
    if (this.listener) {
      document.removeEventListener('keyup', this.listener);
      this.listener = null;
    }
  }

  registerKeyListener() {
    this.listener = (event) => {
      this.onKeyUp(event, this);
    };
    document.addEventListener('keyup', this.listener);
  }


  onKeyUp(event, vm) {
    const key = event.key.toLowerCase();

    const currentTime = Date.now();

    if (currentTime - vm.lastKeyTime > 1000) {
      vm.buffer = '';
    }

    vm.buffer += key;
    vm.lastKeyTime = currentTime;
    vm.checkBuffer();
  }

  // eslint-disable-next-line sonarjs/cognitive-complexity
  checkBuffer() {
    const vm = this;
    const selectionStore = useShiftviewSelectionStore();
    const dialogStore = useGenericDialogStore();
    const timelineStore = useShiftviewTimelineStore();
    const shiftStore = useShiftStore();
    if (dialogStore.isDialogOpened) return;
    const commentRegex = /^1#\d{1,}#/; // 1#commentId#
    const signalRegex = /^2#\d{1,}((\.|,)\d+)?#/; // 2#signalQty#
    const clientMetricsRegex = /^3#.+#.+#.+#/; // 3#measureValue#measureName#measureUnit#
    const changeoverRegex = /^4#\d{1,}#/; // 4#productId#
    const signalWithChangeoverRegex = /^5#\d{1,}((\.|,)\d+)?#\d{1,}#/; // 5#signalQty#productId#
    const scrapRegex = /^6#\d{1,}((\.|,)\d+)?#\d{1,}#.*#/; // 6#scrapQty#scrapReasonId#extraNote#
    const scrapReasonRegex = /^7#\d{1,}#.*#/; // 7#scrapReasonId#extraNote#
    if (this.hashtagRegex.test(vm.buffer)) {
      vm.capitalLetterRegex = vm.buffer.includes('shift3') ? /(shift[a-z])/ : /([a-z]shift)/;
      vm.hashtagRegex = vm.buffer.includes('shift3') ? /shift3/ : /#shift/;
      vm.buffer = vm.buffer.replace(this.hashtagRegex, '#');
    }
    if (vm.capitalLetterRegex && vm.capitalLetterRegex.test(vm.buffer)) {
      const match = vm.buffer.match(vm.capitalLetterRegex)[0];
      const letterToCapitalize = match.split('shift').find((char) => char.length);
      vm.buffer = vm.buffer.replace(match, letterToCapitalize.toUpperCase());
    }
    if (vm.buffer === 'pp') {
      const { timeline } = timelineStore;
      const lastSlice = timeline[timeline.length - 1];
      const slice = lastSlice.isFake && lastSlice.type === 'PRODUCT' ? timeline[timeline.length - 2] : lastSlice;
      selectionStore.selectSlice(slice);
      dialogStore.openDialog(shiftviewDialogs.CHANGEOVER);
      vm.buffer = '';
    } else if (vm.buffer === 'ss' && shiftStore.statistics.shiftTotal.quantity > 0) {
      const slice = vm.getLastProductCircle();
      selectionStore.selectSlice(slice);
      if (!dialogStore.isOpen) {
        dialogStore.openDialog(editScrapDialogConfig);
      }
      vm.buffer = '';
    } else if (vm.buffer === 'cc' && shiftStore.statistics.delaysCount > 0) {
      const slice = vm.getLastUncommentedSlice();
      selectionStore.selectSlice(slice);
      dialogStore.openDialog({ ...shiftviewDialogs.COMMENT_DOWNTIME });
      vm.buffer = '';
    } else if (commentRegex.test(vm.buffer)) {
      const commentId = vm.buffer.split('#')[1];
      vm.applyBarCodeComment(commentId);
      vm.buffer = '';
    } else if (signalRegex.test(vm.buffer)) {
      const signalQty = vm.buffer.split('#')[1];
      vm.applyBarCodeSignalQty(signalQty.replace(',', '.'));
      vm.buffer = '';
    } else if (clientMetricsRegex.test(vm.buffer)) {
      const data = vm.buffer.split('#');
      vm.postClientMetrics(
        {
          measureValue: data[1],
          measureName: data[2],
          measureUnit: data[3],
        },
      );
      vm.buffer = '';
    } else if (changeoverRegex.test(vm.buffer)) {
      const productId = vm.buffer.split('#')[1];
      vm.applyBarCodeChangeover(productId);
      vm.buffer = '';
    } else if (signalWithChangeoverRegex.test(vm.buffer)) {
      const [, signalQty, productId] = vm.buffer.split('#');
      vm.applyBarCodeSignalQty(signalQty.replace(',', '.'), productId);
      vm.buffer = '';
    } else if (scrapRegex.test(vm.buffer)) {
      const parts = vm.buffer.split('#');
      const scrapQty = Number(parts[1].replace(',', '.'));
      const scrapReasonId = Number(parts[2]);
      const scrapNotes = parts[3];
      vm.applyBarCodeScrap({ scrapQty, scrapReasonId, scrapNotes });
      vm.buffer = '';
    } else if (scrapReasonRegex.test(vm.buffer)) {
      const parts = vm.buffer.split('#');
      const scrapReasonId = Number(parts[1]);
      const scrapNotes = parts[2];
      vm.applyBarCodeScrapReason({ scrapReasonId, scrapNotes });
      vm.buffer = '';
    }
  }
}
