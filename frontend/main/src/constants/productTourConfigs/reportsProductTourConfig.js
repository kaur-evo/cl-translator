import { OFFICE_USER } from '@/constants/userRoles';

export const getReportsProductTourConfig = (flowStates) => ({
  isDemoFlow: true,
  description: 'How Evocon supports the analysis of your production data.',
  allowedUserRoles: [OFFICE_USER],
  flows: {
    reportsIntro: {
      id: 'reportsIntro',
      title: 'How Reports work?',
      isCompleted: flowStates?.reportsIntro ?? false,
      steps: [
        {
          title: 'How reports work?',
          descrLines: ["Evocon's Reporting provides a suite of standard reports that uncover productivity losses, highlight improvement opportunities, save time, and support knowledge sharing."],
          img: 'product-tour/reports-intro/reports-intro-1.png',
          tertiaryBtnText: 'Close',
        },
        {
          title: 'All reports in one place',
          descrLines: ['Our standard reports include OEE, downtime, speed loss, scrap, time usage, quantities and cycle times. Each report can also be downloaded as an Excel or PDF file.'],
          img: 'product-tour/reports-intro/reports-intro-2.png',
          showBackBtn: true,
          tertiaryBtnText: 'Close',
        },
        {
          title: 'Find the information you need',
          descrLines: [`Each report offers filters that help you analyze the big picture or zero in on details.
            Also, different chart controls give you the possibility to look at your data from different angles so that insights become easier to find.`],
          img: 'product-tour/reports-intro/reports-intro-3.png',
          showBackBtn: true,
          tertiaryBtnText: 'Close',
        },
      ],
    },
    reportsSaving: {
      id: 'reportsSaving',
      title: 'Saving reports',
      isCompleted: flowStates?.reportsSaving ?? false,
      steps: [
        {
          title: 'Save time by saving reports',
          descrLines: [`Save and reuse your favorite reports to avoid rebuilding them repeatedly.
            Configure a report to your preference, click Save to add it to your favorites, and later update it by making changes and clicking Update for quick access.`],
          img: 'product-tour/reports-saving/reports-saving-1.png',
          tertiaryBtnText: 'Close',
        },
        {
          title: 'Go to meetings prepared',
          descrLines: ['Go to your meetings prepared by saving all your weekly and monthly meetings. No more stress on Mondays because Evocon prepares the data for you.'],
          img: 'product-tour/reports-saving/reports-saving-2.png',
          showBackBtn: true,
          tertiaryBtnText: 'Close',
        },
      ],
    },
    reportsComparing: {
      id: 'reportsComparing',
      title: 'Comparing data',
      isCompleted: flowStates?.reportsComparing ?? false,
      steps: [
        {
          title: 'Compare data',
          descrLines: ['Finding opportunities for improvements and identifying your best (and worst) performing stations or shifts can be done with a few clicks in any report.'],
          img: 'product-tour/reports-comparing/reports-comparing-1.png',
          tertiaryBtnText: 'Close',
        },
        {
          title: 'Easy to miss',
          descrLines: [`All you need to do is change what is on the x-axis.
            And on most reports, you can also change what is on y-axis. The controls for this are in the top right corner of the chart.`],
          img: 'product-tour/reports-comparing/reports-comparing-2.png',
          showBackBtn: true,
          tertiaryBtnText: 'Close',
        },
        {
          title: 'Life saving trick',
          descrLines: ['Last tip: use the back & reset button to make navigation in the reports easier.'],
          img: 'product-tour/reports-comparing/reports-comparing-3.png',
          showBackBtn: true,
          tertiaryBtnText: 'Close',
        },
      ],
    },
    reportsExporting: {
      id: 'reportsExporting',
      title: 'Exporting data',
      isCompleted: flowStates?.reportsExporting ?? false,
      steps: [
        {
          title: 'Export data, all data',
          descrLines: ['If you want to dig deeper into data, full export of all of your production data is just a few clicks away in the reports menu.'],
          img: 'product-tour/reports-exporting/reports-exporting-1.png',
          tertiaryBtnText: 'Close',
        },
        {
          title: "Evocon's API",
          descrLines: ['And if you want to extract data from Evocon for custom analysis (such as in Power BI), you can utilize our API.'],
          img: 'product-tour/reports-exporting/reports-exporting-2.png',
          showBackBtn: true,
          tertiaryBtnText: 'Close',
        },
      ],
    },
  },
});
