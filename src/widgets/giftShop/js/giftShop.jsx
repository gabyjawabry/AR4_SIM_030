import { useState, useEffect, useRef, useContext } from "react";
import { FormattedMessage } from "react-intl";
import "../css/giftShop.scss";
import { motion, useAnimation } from "framer-motion";
import { getAnimation, ShowCorrectStars, useIsVisible } from "../../../container/js/utilities/utilities";

import { Col, Row } from "react-bootstrap";
import AudioWidget from "../../../container/js/audioWidget";
import { PageContext } from "../../../container/js/utilities/context";
import CheckRounded from "../../../container/images/icons/check.svg?react";
import ShowAvatarAndName from "../../../container/js/showAvatarAndName.jsx";
import ShowScoring from "../../../container/js/showScoring.jsx";
import CorrectSFX from "../sounds/gauge_correct.mp3";
import IncorrectSFX from "../sounds/gauge_incorrect.mp3";
import ButtonClickSFX from "../sounds/button_click.mp3";
import { Button } from "react-bootstrap";
import { getAnimationAsync } from "../../../container/js/utilities/helper.jsx";

const GiftShop = (props) => {
  const pageContext = useContext(PageContext);
  const setAudioURL = pageContext.setAudioURL;
  const parameters = props.parameters || {};
  const content = parameters?.content || {};
  const gsOptions = content.OptionsArray || [];
  const containerRef = useRef(null);
  const backgroundVideoRef = useRef(null);
  const controls = useAnimation();
  const isVisible = useIsVisible(containerRef);
  const [selected, setSelected] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [checked, setChecked] = useState(false);
  const [backgroundVideoData, setBackgroundVideoData] = useState(null);
  const { avatarSelected, studentGrade } = useContext(PageContext);
  const [feedbackParams, setFeedbackParams] = useState(null);
  const [correctPurchase, setCorrectPurchase] = useState(false);
  const startTime = useRef(null);
  const audioData = {
    url: content.mainQuestionAudio,
    autoplay: true,
    id: parameters.id || 0,
  };

  useEffect(() => {
    setSelected(null);
    setSubmitted(false);
    setChecked(false);
  }, [content]);

  const checkAnswers = () => {
    if (selected === null) return;

    const selectedGift = gsOptions.find((item) => item.id === selected);
    if (!selectedGift) return;

    const requiredScore = Number(selectedGift.index);
    const userScore = Number(studentGrade);
    const isCorrect = userScore >= requiredScore;

    setSubmitted(true);
    setChecked(true);

    setFeedbackParams({
      class: isCorrect ? "correct" : "incorrect",
      message: isCorrect ? content.feedback.correct.text : content.feedback.incorrect.text,
      audio: isCorrect ? "" : content.feedback.incorrect.audio
    });

    if (isCorrect) {
      setCorrectPurchase(true);
    } else{
      setAudioURL({ id: "incorrectSFX", url: content.feedback.incorrect.audio, type: "incorrectSFX" });
    }
  };

  useEffect(() => {
    setSelected(null);
    setSubmitted(false);
    setChecked(false);
    setCorrectPurchase(false);
    setFeedbackParams(null);
  }, [content]);

  useEffect(() => {
    if (isVisible) {
      startTime.current = Date.now();
      controls.start("animate");

      async function loadBackgroundVideo() {
        try {
          const anim = await getAnimationAsync("Gift_Shop");
          setBackgroundVideoData(anim);
        } catch (err) {
          console.error("Background video load failed:", err);
        }
      }

      loadBackgroundVideo();
    } else {
      controls.start("initial");
    }
  }, [isVisible, controls]);

  return (
    <div className="gs-container w-100 component-container">
      <motion.div ref={containerRef} className="gs-wrapper w-100 component-content" variants={getAnimation("blurIn", 0.8, 0)} initial="initial" animate={controls}>
        <motion.div className="avatarAndScore" variants={getAnimation("flipX", 0.6, 0.4)}>
          <ShowAvatarAndName />
          <ShowScoring />
        </motion.div>

        <motion.div className="mainQuestionHolderDiv">
          <motion.div className="mainQuestionHolder" variants={getAnimation("slideDown", 0.6, 0.4)}>
            <Row className="audio-help-container mb-0 mx-0">
              <Col className="d-flex align-items-center col-1 p-0">
                <AudioWidget data={audioData} audioType="main-question" />
              </Col>
            </Row>

            <div className="mainQuestion" dangerouslySetInnerHTML={{ __html: content.mainQuestion }}/>
          </motion.div>
        </motion.div>

        <div className="gs-game-holder">
          <motion.div className="gs-options" variants={getAnimation("slideLeft", 0.6, 0.9)}>
            {gsOptions.map((opt) => {
              const isSelected = selected === opt.id;
              const requiredScore = Number(opt.index);
              const userScore = Number(studentGrade);
              const isCorrect = submitted && isSelected && userScore >= requiredScore;
              const isWrong = submitted && isSelected && userScore < requiredScore;

              return (
                <button key={opt.id}
                  className={
                    `gs-option
                    ${checked ? "checked" : ""}
                    ${isSelected ? "selected" : ""}
                    ${isCorrect ? "correct" : ""}
                    ${isWrong ? "incorrect" : ""}
                    ${correctPurchase ? "disabled" : ""}`
                  }
                  onClick={() => {
                    if (correctPurchase) return;
                    setSelected(opt.id);
                    setSubmitted(false);
                    setChecked(false);
                    setFeedbackParams(null);
                    setAudioURL({ id: "optionClick", url: ButtonClickSFX, type: "sfx" });
                  }}
                >
                  <div className="shop_gifts" dangerouslySetInnerHTML={{ __html: opt.text }} />

                 {submitted && isSelected && userScore >= Number(opt.index) && (
                    <>
                      <div className="symbolHolder">
                        <CheckRounded />
                      </div>
                      <ShowCorrectStars />
                    </>
                  )}
                </button>
              );
            })}
          </motion.div>
        </div>

        <div className="buy-gift-feedback-container">
          {feedbackParams && (
            <motion.div className={`${feedbackParams.class} feedback-banner`} {...getAnimation("slideUp", 0.6, 0)}>
              <div className="feedback-text" dangerouslySetInnerHTML={{ __html: feedbackParams.message }} />
            </motion.div>
          )}
        </div>
      </motion.div>
      <div className="buy-gift-btn-holder">
        <Button type="button" className="buy-gift-btn"
          disabled={!selected}
          onClick={() => {
            if (correctPurchase) {
              const swiper = document.querySelector("#container-swiper")?.swiper; 
              if (swiper) {
                swiper.slideNext();
              }
              return;
            }
            checkAnswers();
          }}
        >
         { correctPurchase ? <FormattedMessage id='feedback.continue' /> : <FormattedMessage id='feedback.buy' /> }
        </Button>
      </div>
      {backgroundVideoData && (
        <video ref={backgroundVideoRef} className="videoSplashScreen" src={backgroundVideoData} poster={`images/mission1_intro_${avatarSelected}.png`} autoPlay muted playsInline />
      )}
    </div>
  );
};

export default GiftShop;