export let PageData = {};
export let QuestionData = {};
export let SlideData = {};
export let LabelsData = {};
// export let AnimationsData = {
//   burjKhalifaFail: null,
//   burjKhalifaWin: null,
//   burjKhalifaBase: null,
//   dinosaurFail: null,
//   dinosaurWin: null,
//   dinosaurBase: null,
//   missileFail: null,
//   missileWin: null,
//   missileBase: null,
//   timeClockFail: null,
//   timeClockWin: null,
//   timeClockBase: null  
// };
export { default as LessonQuestion } from '../lessonQuestion.jsx';
export { default as LessonSlide } from '../lessonSlide.jsx';
// export { default as StaticHTML } from '../../../widgets/staticHTML/js/staticHTML.jsx';
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


  let response = {};
  LabelsData = await import('../../json/Labels.json').then(module=>module?.default);
  if (typeof LabelsData == "string"){
    response = await fetch(LabelsData);
    LabelsData = await response.json();
  }
  
  result = true;
  
  return result;
}

// export async function preloadAnimations() {
//   const animationFiles = [
//     'animations/burjKhalifaFail.json',
//     'animations/burjKhalifaWin.json',
//     'animations/burjKhalifaBase.json',
//     'animations/dinosaurFail.json',
//     'animations/dinosaurWin.json',
//     'animations/dinosaurBase.json',
//     'animations/missileFail.json',
//     'animations/missileWin.json',
//     'animations/missileBase.json',
//     'animations/timeClockFail.json',
//     'animations/timeClockWin.json',
//     'animations/timeClockBase.json'
//   ];

//   const responses = await Promise.all(animationFiles.map(path => fetch(path)));

//   responses.forEach((resp, index) => {
//     if (!resp.ok) {
//       throw new Error(`Failed to load animation: ${animationFiles[index]}`);
//     }
//   });

//   const jsonData = await Promise.all(responses.map(resp => resp.json()));

//   AnimationsData.burjKhalifaFail = jsonData[0];
//   AnimationsData.burjKhalifaWin = jsonData[1];
//   AnimationsData.burjKhalifaBase = jsonData[2];
//   AnimationsData.dinosaurFail = jsonData[3];
//   AnimationsData.dinosaurWin = jsonData[4];
//   AnimationsData.dinosaurBase = jsonData[5];
//   AnimationsData.missileFail = jsonData[6];
//   AnimationsData.missileWin = jsonData[7];
//   AnimationsData.missileBase = jsonData[8];
//   AnimationsData.timeClockFail = jsonData[9];
//   AnimationsData.timeClockWin = jsonData[10];
//   AnimationsData.timeClockBase = jsonData[11];
// }

// export function preloadAnimationsDuringIdle() {
//   if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
//     window.requestIdleCallback(() => {
//       preloadAnimations().catch(console.error);
//     }, { timeout: 3000 });
//   } else {
//     setTimeout(() => {
//       preloadAnimations().catch(console.error);
//     }, 1000);
//   }
// }


// helper.jsx

// ======================================================
// GLOBAL CACHE
// ======================================================

export const AnimationsData = {};

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

    console.log(`Animation loaded: ${key}`);

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

  console.log('All animations preloaded');
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
