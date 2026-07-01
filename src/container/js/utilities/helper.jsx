import labelsUrl from '../../json/Labels.json?url';
export let PageData = {};
export let QuestionData = {};
export let SlideData = {};
export let LabelsData = {};
export const AnimationsData = {};
export { default as LessonQuestion } from '../lessonQuestion.jsx';
export { default as LessonSlide } from '../lessonSlide.jsx';
export const defaultScreenWidth = 1920;
export const defaultScreenHeight = 1080;

export async function fetchJSONData() {
  let result = false;
  
  const [pageResponse, questionResponse, slideResponse] = await Promise.all([
    fetch('data/Page.json'),
    fetch('data/Question.json'),
    fetch('data/Slide.json')
  ]);
  
  if (!pageResponse.ok || !questionResponse.ok || !slideResponse.ok) {
    throw new Error('Failed to load one or more JSON files');
  }
  
  PageData = await pageResponse.json();
  QuestionData = await questionResponse.json();
  SlideData = await slideResponse.json();

  const labelsResponse = await fetch(labelsUrl);
  if (!labelsResponse.ok) {
    throw new Error('Failed to load Labels.json');
  }
  LabelsData = await labelsResponse.json();
  
  result = true;
  
  return result;
}

const animationImports = {
  
  mission1_intro_avatar01: () =>
    import('../../videos/mission1_intro_avatar01.mp4'),

  mission1_intro_avatar02: () =>
    import('../../videos/mission1_intro_avatar02.mp4'),

  mission1_intro_avatar03: () =>
    import('../../videos/mission1_intro_avatar03.mp4'),

  mission1_intro_avatar04: () =>
    import('../../videos/mission1_intro_avatar04.mp4'),

  mission1_avatar01: () =>
    import('../../videos/mission1_avatar01.mp4'),

  mission1_avatar02: () =>
    import('../../videos/mission1_avatar02.mp4'),

  mission1_avatar03: () =>
    import('../../videos/mission1_avatar03.mp4'),

  mission1_avatar04: () =>
    import('../../videos/mission1_avatar04.mp4'),

   mission2_intro_avatar01: () =>
    import('../../videos/mission2_intro_avatar01.mp4'),

  mission2_intro_avatar02: () =>
    import('../../videos/mission2_intro_avatar02.mp4'),

  mission2_intro_avatar03: () =>
    import('../../videos/mission2_intro_avatar03.mp4'),

  mission2_intro_avatar04: () =>
    import('../../videos/mission2_intro_avatar04.mp4'),

  mission2_question1_avatar01: () =>
    import('../../videos/mission2_question1_avatar01.mp4'),

  mission2_question1_avatar02: () =>
    import('../../videos/mission2_question1_avatar02.mp4'),

   mission2_question1_avatar03: () =>
    import('../../videos/mission2_question1_avatar03.mp4'),

  mission2_question1_avatar04: () =>
    import('../../videos/mission2_question1_avatar04.mp4'),

  mission2_question2: () =>
    import('../../videos/mission2_question2.mp4'),

  mission2_question3: () =>
    import('../../videos/mission2_question3.mp4'),

   mission3_intro_avatar01: () =>
    import('../../videos/mission3_intro_avatar01.mp4'),

  mission3_intro_avatar02: () =>
    import('../../videos/mission3_intro_avatar02.mp4'),

  mission3_intro_avatar03: () =>
    import('../../videos/mission3_intro_avatar03.mp4'),

  mission3_intro_avatar04: () =>
    import('../../videos/mission3_intro_avatar04.mp4'),

  Gift_Shop: () =>
    import('../../videos/Gift_Shop.mp4')
};

async function loadAnimation(key, importer) {
  try {

    // already cached
    if (AnimationsData[key]) {
      return AnimationsData[key];
    }

    const module = await importer();

    const animationData = module.default;

    // progressive caching
    AnimationsData[key] = animationData;

    // console.log(`Animation loaded: ${key}`);

    return animationData;

  } catch (error) {

    console.error(`Failed loading animation: ${key}`, error);

    return null;
  }
}

export async function preloadAnimations() {

  const entries = Object.entries(animationImports);

  // IMPORTANT:
  // controls simultaneous loading count
  const batchSize = 2;

  for (let i = 0; i < entries.length; i += batchSize) {

    const batch = entries.slice(i, i + batchSize);

    // load current batch in parallel
    await Promise.all(
      batch.map(([key, importer]) =>
        loadAnimation(key, importer)
      )
    );

    // allow browser to breathe between batches
    await new Promise(resolve =>
      setTimeout(resolve, 50)
    );
  }

  // console.log('All animations preloaded');
}

export function preloadAnimationsDuringIdle() {

  const startPreloading = () => {
    preloadAnimations().catch(console.error);
  };

  if (
    typeof window !== 'undefined' &&
    'requestIdleCallback' in window
  ) {

    window.requestIdleCallback(startPreloading, {
      timeout: 5000
    });

  } else {

    setTimeout(startPreloading, 1000);

  }
}

export function getLottieAnimation(key) {
  return AnimationsData[key] || null;
}

export async function getAnimationAsync(key) {
  // already in cache
  if (AnimationsData[key]) {
    return AnimationsData[key];
  }

  // fallback: load on demand
  console.log(key);
  const module = await animationImports[key]();

  const data = module.default;
  AnimationsData[key] = data;

  return data;
}
