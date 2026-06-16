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
import { getAnimationAsync } from '../../../container/js/utilities/helper.jsx';

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
  const feedbackVideoRef = useRef();

  const renderBgImage = () => {
    const first = findStatusByIndex(pageContext.tocState, 0);
    const second = findStatusByIndex(pageContext.tocState, 1);

    return (
      (first === "correct" ? "1" : "0") +
      (second === "correct" ? "0" : "0")
    );
  };

  const findStatusByIndex = (state, index) => {
    const item = Object.values(state || {}).find(
      (el) => el.index === index
    );
    return item ? item.status : null;
  };

  const audioData = {
    url: content.mainQuestionAudio,
    autoplay: true,
    id: parameters.id || 0
  };

  useEffect(() => {
    if (!content) return;

    const mcCorrectOptions = chooseUniqueItems(content.correctAnswersArray, 1);
    const mcWrongOptions = chooseUniqueItems(content.wrongAnswersArray, 2);

    const mergedArray = [...mcCorrectOptions, ...mcWrongOptions];

    const result = mergedArray.map((text, index) => ({
      id: index + 1,
      text,
      correct: index < mcCorrectOptions.length, // safer than index === 0
    }));
    
    setMcOptions(shuffle(result));
  }, [content]);

  useEffect(() => {
    setSubmitCount(0);
    setFeedbackParams({});
  }, [0]);

  const getFeedbackVideo = () => {

    async function loadFeedbackVideo() {
    
      const anim = await getAnimationAsync(
        `mission1_${renderBgImage()}`
      );

      setFeedbackVideoData(anim);
    }

    loadFeedbackVideo();
  }

  const checkAnswers = (type) => {
    let feedbackData = {};

    setChecked(true);
    if (selected === null) return;

    const isCorrect = selected === correctOption.id;

    setSubmitted(true);

    const tocIndex = content.index; 
    const newTocState = pageContext.tocState;
    newTocState.push({
      index: tocIndex,
      status: isCorrect ? "correct" : "incorrect"
    });

    // setFeedbackParams({
    //   class: isCorrect ? "correct" : "incorrect",
    //   message: isCorrect ? content.feedback.correct.text : content.feedback.incorrect.text,
    //   result: isCorrect ? "correct" : "incorrect",
    //   isCorrect: isCorrect,
    //   audio: isCorrect ? content.feedback?.correct?.audio : content.feedback?.incorrect?.audio
    // });

    feedbackData = {
      class: isCorrect ? "correct" : "incorrect",
      message: isCorrect ? content.feedback.correct.text : content.feedback.incorrect.text,
      result: isCorrect ? "correct" : "incorrect",
      isCorrect: isCorrect,
      audio: isCorrect ? content.feedback?.correct?.audio : content.feedback?.incorrect?.audio
    };

    setFeedbackParams(feedbackData);

    getFeedbackVideo();
    
    //return { result: isCorrect, lastGame: isCorrect};
      return { feedbackData };
  };
  
  useEffect(() => {
    if (isVisible) {      
      controls.start("animate");
    }else{
      controls.start("initial");
    }
  }, [isVisible]);

  useEffect(() => {
    if (feedbackVideoData && feedbackVideoRef.current) {      
      feedbackVideoRef.current.play();
    }
  }, [feedbackVideoData]);

  return (
    <div className="mc-container w-100 component-container" 
      style={{
        backgroundImage: `url(images/train_bg_${renderBgImage()}.png)`,
      }}>

      <HintButton hintData={content.hintData} setHintData={setHintData} />

      <GoToTOCButton showResults={content.showResult} />

      {feedbackVideoData && 
          <video ref={feedbackVideoRef} className='feedbackVideo' src={feedbackVideoData} poster="images/train_bg_00.png"/>
      }

      <motion.div ref={containerRef} className="mc-wrapper w-100 component-content" variants={getAnimation("blurIn", 0.8, 0)} initial="initial" animate={controls}>
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
        
        {selected && (
          <div className="feedback-container-holder">
            <Feedback               
              feedback={feedbackParams}
              submitLimit={content.submitLimit}
              handleSubmit={checkAnswers}
              ref={feedbackSubmitButtonRef}
            />
          </div>
        )}
      </motion.div>  
    </div>
  );
};

export default MultipleChoice;
