import step1Image from '@/assets/images/product-tour/ai-insights/Extra_notes-1-1.png';
import step2Image from '@/assets/images/product-tour/ai-insights/Extra_notes-2-2.png';
import step3Image from '@/assets/images/product-tour/ai-insights/Extra_notes-3-3.png';
import step4Image from '@/assets/images/product-tour/ai-insights/Extra_notes-4-4.png';

export interface TutorialStepConfig {
  title: string;
  description: string;
  image: string;
}

export const getTutorialSteps = (t: (key: string) => string): TutorialStepConfig[] => [
  {
    title: t('Get AI insights from extra notes'),
    description: t('Uncover hidden patterns in downtime data from extra notes added to stop reasons.'),
    image: step1Image,
  },
  {
    title: t('At least 50 notes needed'),
    description: t('Choose a larger time period to find stops and stations with enough notes.'),
    image: step2Image,
  },
  {
    title: t('Select stop reason & station'),
    description: t('Stop reasons with enough notes within a station are highlighted for analysis.'),
    image: step3Image,
  },
  {
    title: t('Get results to e-mail'),
    description: t('Receive the summary and full analysis to your e-mail in a few minutes.'),
    image: step4Image,
  },
];
