import { OFFICE_USER } from '@/constants/userRoles';

export const getDashboardProductTourConfig = (flowStates) => ({
  isDemoFlow: true,
  description: 'How Evocon makes your production data accessible and actionable.',
  allowedUserRoles: [OFFICE_USER],
  flows: {
    dbOverview: {
      id: 'dbOverview',
      title: 'Dashboard overview',
      isCompleted: flowStates?.dbOverview ?? false,
      steps: [
        {
          title: 'Data at a glance',
          descrLines: ["Evocon's Dashboard simplifies data visualization, helping you monitor production performance in real time—anytime, anywhere."],
          img: 'product-tour/db-overview/db-overview-1.png',
          tertiaryBtnText: 'Close',
        },
        {
          title: 'Types of widgets',
          descrLines: ['The Dashboard has multiple different types of widgets so you can track the data you want, the machines you want and the timeframe you want.'],
          img: 'product-tour/db-overview/db-overview-2.png',
          showBackBtn: true,
          tertiaryBtnText: 'Close',
        },
        {
          title: 'Understanding through data',
          descrLines: ['The simple, yet effective visualisation of data allows you use the Dashboard to gain an understanding of what is actually going on in production.'],
          img: 'product-tour/db-overview/db-overview-3.png',
          showBackBtn: true,
          tertiaryBtnText: 'Close',
        },
      ],
    },
    dbCreation: {
      id: 'dbCreation',
      title: 'Creating dashboards',
      isCompleted: flowStates?.dbCreation ?? false,
      steps: [
        {
          title: 'Adding widgets',
          descrLines: ["To add a new widget, simply click the add button. And once you've defined your preferences, click Save to finalize."],
          img: 'product-tour/db-creation/db-creation-1.png',
          tertiaryBtnText: 'Close',
        },
        {
          title: 'Add tabs & rearrange widgets',
          descrLines: ['You can also add new tabs and rearrange widgets to organize data any way you like — create multiple dashboards for different objectives.'],
          img: 'product-tour/db-creation/db-creation-2.png',
          showBackBtn: true,
          tertiaryBtnText: 'Close',
        },
        {
          title: 'Decisions backed by data',
          descrLines: ['By creating widgets and personalizing the dashboard, you gain valuable insight into your production data and enable accurate decision-making.'],
          img: 'product-tour/db-creation/db-creation-3.png',
          showBackBtn: true,
          tertiaryBtnText: 'Close',
        },
      ],
    },
    dbInvolving: {
      id: 'dbInvolving',
      title: 'Involving everyone',
      isCompleted: flowStates?.dbInvolving ?? false,
      steps: [
        {
          title: 'Unlimited users',
          descrLines: ['With Evocon you can add as many users to the system as you want. This enables everyone to create dashboards that support their function and analysis.'],
          img: 'product-tour/db-involving/db-involving-1.png',
          tertiaryBtnText: 'Close',
        },
        {
          title: 'Sharing of dashboards',
          descrLines: ['Administrators can also share their dashboards with other Evocon users, ensuring data remains visible and accessible to everyone in the company.'],
          img: 'product-tour/db-involving/db-involving-2.png',
          showBackBtn: true,
          tertiaryBtnText: 'Close',
        },
      ],
    },
  },
});
