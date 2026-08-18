import { OFFICE_USER } from '@/constants/userRoles';

export const getFactoryOverviewProductTourConfig = (flowStates) => ({
  isDemoFlow: true,
  description: 'Basics of how you can monitor the performance of your factory(s).',
  allowedUserRoles: [OFFICE_USER],
  flows: {
    foIntro: {
      id: 'foIntro',
      title: 'What is Factory Overview?',
      isCompleted: flowStates?.foIntro ?? false,
      steps: [
        {
          title: 'Factory performance in real-time',
          descrLines: [`With Factory Overview, everyone can see each machine's status in real time,
            giving your team the transparency needed to manage the entire factory and avoid unpleasant surprises.`],
          img: 'product-tour/fo-intro/fo-intro-1.png',
          tertiaryBtnText: 'Close',
        },
        {
          title: 'Live & Timeline',
          descrLines: [`The view has two options: Live and Timeline.
            Use Live to see how production machines performed in the last hour, or switch to Timeline to review progress of longer timeframes.`],
          img: 'product-tour/fo-intro/fo-intro-2.png',
          showBackBtn: true,
          tertiaryBtnText: 'Close',
        },
      ],
    },
    foLiveIntro: {
      id: 'foLiveIntro',
      title: 'Introduction to Live view',
      isCompleted: flowStates?.foLiveIntro ?? false,
      urlToNavigate: '/factory-view/realtime',
      steps: [
        {
          title: '1 card = 1 station',
          descrLines: ["In Live view, each card represents a single station's performance, showing the speed of the last hour, current OEE and product, and quantities produced."],
          img: 'product-tour/fo-live-view/fo-live-view-1.png',
          tertiaryBtnText: 'Close',
        },
        {
          title: 'Status color',
          descrLines: ['The color of the card indicates the status of the station: green - optimal production, yellow - slow production, red - machine stopped, gray - planned stop.'],
          img: 'product-tour/fo-live-view/fo-live-view-2.png',
          showBackBtn: true,
          tertiaryBtnText: 'Close',
        },
      ],
    },
    foTimelineIntro: {
      id: 'foTimelineIntro',
      title: 'Basics of Timeline view',
      isCompleted: flowStates?.foTimelineIntro ?? false,
      urlToNavigate: '/factory-view/timeline',
      steps: [
        {
          title: 'Same idea, different look',
          descrLines: ['In Timeline, production data is visualized using the same principles as in Live view but we focus on a longer timeframe.'],
          img: 'product-tour/fo-timeline-view/fo-timeline-view-1.png',
          tertiaryBtnText: 'Close',
        },
        {
          title: '1 Row = 1 Station',
          descrLines: ['Here, one row equals the data of one station. You can visualise up to 24 hours on one row and review performance of the last 7 days.'],
          img: 'product-tour/fo-timeline-view/fo-timeline-view-2.png',
          showBackBtn: true,
          tertiaryBtnText: 'Close',
        },
        {
          title: 'Tailoring the look',
          descrLines: ['Customize the Timeline by rearranging lines, filtering machines of interest, and choosing which KPI to focus on.'],
          img: 'product-tour/fo-timeline-view/fo-timeline-view-3.png',
          showBackBtn: true,
          tertiaryBtnText: 'Close',
        },
      ],
    },
    foGrid: {
      id: 'foGrid',
      title: 'Grid view: Different perspective',
      isCompleted: flowStates?.foGrid ?? false,
      steps: [
        {
          title: 'Extra: Grid View',
          descrLines: [`Additionally, Evocon offers Grid View—a separate feature in the main menu—that supports factory-wide performance analysis for up to eight machines,
            providing a unique perspective beyond Live and Timeline.`],
          img: 'product-tour/fo-grid-view/fo-grid-view-1.png',
          tertiaryBtnText: 'Close',
        },
      ],
    },
  },
});
