export let PageData = {};
export let QuestionData = {};
export let SlideData = {};
export let LabelsData = {};
export let AnimationsData = {
  burjKhalifaFail: null,
  burjKhalifaWin: null,
  burjKhalifaBase: null,
  dinosaurFail: null,
  dinosaurWin: null,
  dinosaurBase: null,
  missileFail: null,
  missileWin: null,
  missileBase: null,
  timeClockFail: null,
  timeClockWin: null,
  timeClockBase: null  
};
export { default as LessonQuestion } from '../lessonQuestion.jsx';
export { default as LessonSlide } from '../lessonSlide.jsx';
// export { default as StaticHTML } from '../../../widgets/staticHTML/js/staticHTML.jsx';
export const defaultScreenWidth = 1920;
export const defaultScreenHeight = 1080;

export async function fetchJSONData() {
  let result = false;
  
  const [pageResponse, questionResponse, slideResponse, burjKhalifaFail, burjKhalifaWin, burjKhalifaBase, dinosaurFail, dinosaurWin, dinosaurBase, missileFail, missileWin, missileBase, timeClockFail, timeClockWin, timeClockBase] = await Promise.all([
    fetch('data/Page.json'),
    fetch('data/Question.json'),
    fetch('data/Slide.json'),
    fetch('animations/burjKhalifaFail.json'),
    fetch('animations/burjKhalifaWin.json'),
    fetch('animations/burjKhalifaBase.json'),
    fetch('animations/dinosaurFail.json'),
    fetch('animations/dinosaurWin.json'),
    fetch('animations/dinosaurBase.json'),
    fetch('animations/missileFail.json'),
    fetch('animations/missileWin.json'),
    fetch('animations/missileBase.json'),
    fetch('animations/timeClockFail.json'),
    fetch('animations/timeClockWin.json'),
    fetch('animations/timeClockBase.json')
  ]);
  
  if (!pageResponse.ok || !questionResponse.ok || !slideResponse.ok) {
    throw new Error('Failed to load one or more JSON files');
  }
  
  PageData = await pageResponse.json();
  QuestionData = await questionResponse.json();
  SlideData = await slideResponse.json();
  AnimationsData.burjKhalifaFail = await burjKhalifaFail.json();
  AnimationsData.burjKhalifaWin = await burjKhalifaWin.json();
  AnimationsData.burjKhalifaBase = await burjKhalifaBase.json();
  AnimationsData.dinosaurFail = await dinosaurFail.json();
  AnimationsData.dinosaurWin = await dinosaurWin.json();
  AnimationsData.dinosaurBase = await dinosaurBase.json();
  AnimationsData.missileFail = await missileFail.json();
  AnimationsData.missileWin = await missileWin.json();
  AnimationsData.missileBase = await missileBase.json();
  AnimationsData.timeClockFail = await timeClockFail.json();
  AnimationsData.timeClockWin = await timeClockWin.json();
  AnimationsData.timeClockBase = await timeClockBase.json();

  let response = {};
  LabelsData = await import('../../json/Labels.json').then(module=>module?.default);
  if (typeof LabelsData == "string"){
    response = await fetch(LabelsData);
    LabelsData = await response.json();
  }
  
  result = true;
  
  return result;
}
