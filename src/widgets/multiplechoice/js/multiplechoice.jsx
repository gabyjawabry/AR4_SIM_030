import { useState, useEffect, useRef, useContext } from 'react';
import "../css/multipleChoice.scss";
import { motion, useAnimation } from "framer-motion";
import Feedback from "../../../container/js/feedback";
import { getAnimation, ShowCorrectStars, shuffle, chooseUniqueItems, useIsVisible } from "../../../container/js/utilities/utilities";
import { Col, Row } from 'react-bootstrap';
import AudioWidget from '../../../container/js/audioWidget';
import { PageContext } from "../../../container/js/utilities/context";
import CheckRounded from "../../../container/images/icons/check.svg?react";
import CorrectStars from "../../../container/images/correct-stars.svg?react";
import GoToTOCButton from '../../../container/js/showTOCBtn.jsx';
import HintButton from '../../../container/js/hintButton.jsx';
import VideoPlayer from "../../videoPlayer/js/videoPlayer.jsx";
import ButtonClickSFX from "../sounds/button_click.mp3";
import ShowAvatarAndName from '../../../container/js/showAvatarAndName.jsx';
import ShowScoring from '../../../container/js/showScoring.jsx';
import { getAnimationAsync } from '../../../container/js/utilities/helper.jsx';
import CorrectSFX from '../sounds/gauge_correct.mp3';
import IncorrectSFX from '../sounds/gauge_incorrect.mp3';

const MultipleChoice = (props) => {
  const pageContext = useContext(PageContext);
  const setAudioURL = pageContext.setAudioURL;
  const parameters = props.parameters || {};
  const content = parameters?.content || {};
  const containerRef = useRef(null);
  const [hintData, setHintData] = useState('');
  const [selected, setSelected] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [checked, setChecked] = useState(false);
  const [feedbackParams, setFeedbackParams] = useState(null);
  const [submitCount, setSubmitCount] = useState(0);
  const feedbackSubmitButtonRef = useRef();
  const [mcOptions, setMcOptions] = useState([]);
  const correctOption = mcOptions.find(o => o.correct);
  const controls = useAnimation();
  const isVisible = useIsVisible(containerRef);
  const [feedbackVideoData, setFeedbackVideoData] = useState(null);
  const [currentRound, setCurrentRound] = useState(0);
  const roundData = content.rounds?.[currentRound] || {};
  const feedbackVideoRef = useRef();
  const [backgroundVideoData, setBackgroundVideoData] = useState(null);
  const backgroundVideoRef = useRef();
  const { avatarSelected } =useContext(PageContext);
  const [withExplanationScreen, setWithExplanationScreen] = useState(content.withExplanationScreen || false);
  const startTime = useRef(null);


  const audioData = {
    url: roundData.mainQuestionAudio,
    autoplay: true,
    id: parameters.id || 0
  };

  useEffect(() => {
    if (!roundData) return;

    const mcCorrectOptions = roundData.correctAnswersArray.map(item => ({
    ...item,
     correct: true,
      }));

    const mcWrongOptions = roundData.wrongAnswersArray.map(item => ({
    ...item,
     correct: false,
    }));

    const mergedArray = [...mcCorrectOptions, ...mcWrongOptions];

    const result = mergedArray
      .sort((a, b) => a.index - b.index)
      .map((item, idx) => ({
        id: idx + 1,
        text: item.text,
        index: item.index,
        correct: item.correct,
      }));

  setMcOptions(result);

  setSelected(null);
    setSubmitted(false);
    setChecked(false);
    setFeedbackParams({});
  }, [currentRound]);



  useEffect(() => {
    async function loadBackgroundVideo() {
      const anim = await getAnimationAsync(
        `mission1_${avatarSelected}`
      );  

      setBackgroundVideoData(anim);
    } 

    if (avatarSelected) {
      loadBackgroundVideo();
    }
  }, [avatarSelected]);
    useEffect(() => {
      setSubmitCount(0);
      setFeedbackParams({});
    }, [0]);  


  const goToNextRound = () => {
    const isLastRound =
      currentRound === content.rounds.length - 1; 

    if (!isLastRound) {
      setCurrentRound(prev => prev + 1);  

      setSelected(null);
      setSubmitted(false);
      setChecked(false);
      setFeedbackParams({});
    } else {
      const swiper =
        document.querySelector("#container-swiper")
          ?.swiper; 

      if (swiper) {
        swiper.slideNext();
      }
    }
  };
  const checkAnswers = (type) => {
    let feedbackData = {};
    if (type === "tryagain") {
      setSelected(null);
      setSubmitted(false);
      setChecked(false);
      setFeedbackParams({});
      return;
    } 

    if (type === "reset") {
      setSelected(null);
      setSubmitted(false);
      setChecked(false);
      setFeedbackParams({});
      return;
    }



    setChecked(true);
    if (selected === null) return;
    const isCorrect = selected === correctOption.id;
    const isLastRound =
    currentRound === content.rounds.length - 1; 

    feedbackData = {
      class: isCorrect ? "correct" : "incorrect",
      message: isCorrect
        ? roundData.feedback.correct.text
        : roundData.feedback.incorrect.text,
      result: isCorrect ? "correct" : "incorrect",
      isCorrect,
      audio: isCorrect
        ? roundData.feedback?.correct?.audio
        : roundData.feedback?.incorrect?.audio,
    };
    setSubmitted(true);
    const newGrade = isCorrect ? pageContext.studentGrade + 5: Math.max(0, pageContext.studentGrade - 5);
		pageContext.setStudentGrade(newGrade);
    const tocIndex = roundData.index; 
    const newTocState = pageContext.tocState;
    newTocState.push({
      index: tocIndex,
      status: isCorrect ? "correct" : "incorrect"
    });

    feedbackData = {
      class: isCorrect ? "correct" : "incorrect",
      message: isCorrect ? roundData.feedback.correct.text : roundData.feedback.incorrect.text,
      canRetry: !isCorrect && pageContext.studentGrade > 0,
      result: isCorrect ? "correct" : "incorrect",
      isCorrect: isCorrect,
      audio: isCorrect ? roundData.feedback?.correct?.audio : roundData.feedback?.incorrect?.audio,
      sfx: isCorrect ? CorrectSFX : IncorrectSFX
    };

    setFeedbackParams(feedbackData);

    // getFeedbackVideo();
    
    //return { result: isCorrect, lastGame: isCorrect};
      return { feedbackData };
  };
  
  useEffect(() => {
    if (isVisible || !withExplanationScreen) {  
      startTime.current = Date.now();    
      controls.start("animate");
    }else{
      controls.start("initial");
    }
  }, [isVisible, withExplanationScreen]); 

  useEffect(() => {
    if (feedbackVideoData && feedbackVideoRef.current) {      
      feedbackVideoRef.current.play();
    }
  }, [feedbackVideoData]);

  return (
    <div className="mc-container w-100 component-container" 
      style={{
        backgroundImage: `url(images/train_bg.png)`,
      }}>


      {feedbackVideoData && 
          <video ref={feedbackVideoRef} className='feedbackVideo' src={feedbackVideoData} poster="images/train_bg_00.png"/>
      }

      <motion.div ref={containerRef} className="mc-wrapper w-100 component-content" variants={getAnimation("blurIn", 0.8, 0)} initial="initial" animate={controls}>
        <motion.div className="avatarAndScore" variants={getAnimation("flipX", 0.6, 0.4)} initial="initial" animate={controls}>
					<ShowAvatarAndName />
					<ShowScoring />
				</motion.div> 
 <div className="mc-game-container">
         {pageContext.studentGrade===0 ? (
				    <HintButton/>
			    ):<></>}
          <motion.div className="mainQuestionHolderDiv">
          <motion.div className="mainQuestionHolder" variants={getAnimation("slideDown", 0.6, 0.4)} initial="initial" animate={controls}>
            <Row className="audio-help-container mb-0 mx-0">
              <Col className="d-flex align-items-center justify-content-start col-1 p-0">
                <AudioWidget data={audioData} audioType="main-question" />
              </Col>
            </Row>
            <motion.div className="mainQuestion" dangerouslySetInnerHTML={{ __html: content.mainQuestion }} />
          </motion.div>
          </motion.div>
        {withExplanationScreen ? (
          <motion.div className="text-row-1" variants={getAnimation("scaleIn", 0.6, 0.7)} initial="initial" animate={controls}>
            <motion.div className="text-col-1 w-10" variants={getAnimation("slideRight", 0.6, 1.1)} initial="initial" animate={controls}>
              <div className="explanation-screen">
                <img src={content.explanationScreen.image} alt="Explanation" className="img-fluid"/>
            <div className="startLessonBtnHolder">
                <button className="startLessonBtn"
                  onClick={() => {
                     setWithExplanationScreen(false);
                     requestAnimationFrame(() => {
                       controls.start("animate");
                     });
                   }}
                >
                  استمر
                </button>
              </div>
              </div>
            </motion.div>
          </motion.div>
        ) : (
        <div className="mc-game-holder">
          <motion.div ref={containerRef} className="mc-content w-100" variants={getAnimation("blurIn", 0.8, 0)} initial="initial" animate={controls}>
          <motion.div className="option-col col d-flex align-items-center justify-content-center" variants={getAnimation("slideLeft", 0.6, 0.9)} initial="initial" animate={controls}>
            <div className="mc-options">
              {mcOptions.map((opt) => {
                const isSelected = selected === opt.id;
                const isCorrect = submitted && isSelected && opt.correct;
                const isWrong = submitted && isSelected && !opt.correct;

                return (
                  <button
                    key={opt.id}
                    className={`mc-option
                      ${checked ? "checked" : ""}
                      ${isSelected ? "selected" : ""}
                      ${isCorrect ? "correct" : ""}
                      ${isWrong ? "incorrect" : ""}   
                      ${submitted ? "disabled" : ""}   
                    `}
                    onClick={() => {
                      setSelected(opt.id);
                      setAudioURL({ id: "optionClick", url: ButtonClickSFX, type: "sfx" });
                      // setSubmitted(true);
                    }}            
                  >
                    {opt.text}
                    {opt.correct && submitted && isSelected && (
                        <>
                          <div className='symbolHolder'>
                            <CheckRounded className={`me-3`} /> 
                          </div>
                          <ShowCorrectStars />
                        </>
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
          </motion.div>
              
          {selected && pageContext.studentGrade !=0  && (
          <div className="feedback-container-holder">
            <Feedback
              feedback={feedbackParams}
              submitLimit={roundData.submitLimit}
              handleSubmit={checkAnswers}
              handleContinue={goToNextRound}
              ref={feedbackSubmitButtonRef}
            />
          </div>
          )}  


         {content.rounds?.length > 1 && (
				<div className="round-progress">
					{content.rounds.map((roundMap, roundIndex) => (
						<div  className="dotAndLine" key={roundIndex}>
							<div className={`round-dot ${ roundIndex < currentRound ? "completed" : roundIndex === currentRound ? "active" : ""}`}>
								{roundIndex + 1}
							</div>

							{roundIndex < content.rounds.length - 1 && (
								<div className={`round-line ${ roundIndex < currentRound ? "completed" : "" }`}/>
							)}
						</div>
					))}
				</div>
  				)}
        </div>
        )}
         </div>
      </motion.div>  
      {backgroundVideoData && 
					<video
						ref={backgroundVideoRef}
						className="videoSplashScreen"
						src={backgroundVideoData}
						poster={`images/mission1_intro_${avatarSelected}.png`}
						autoPlay
						muted
						playsInline
					/>      
				}
    </div>
  );
};

export default MultipleChoice;
