import React, { useState, useRef, useEffect, useContext } from "react";
import "../css/dropdownList.scss";
import { motion, useAnimation } from "framer-motion";
import { Col, Row } from 'react-bootstrap';
import AudioWidget from '../../../container/js/audioWidget';
import Feedback from "../../../container/js/feedback";
import { getAnimation, shuffle, chooseUniqueItems, ShowCorrectStars, useIsVisible } from "../../../container/js/utilities/utilities";
import CheckRounded from "../../../container/images/icons/check.svg?react";
import GoToTOCButton from '../../../container/js/showTOCBtn.jsx';
import { PageContext } from "../../../container/js/utilities/context";
import HintButton from '../../../container/js/hintButton.jsx';
import ddOpen from '../sounds/ddOpen.mp3';
import ddClose from '../sounds/ddClose.mp3';
import { getAnimationAsync } from '../../../container/js/utilities/helper.jsx';

const DropdownList = (props) => {

  const pageContext = useContext(PageContext);
  const setAudioURL = pageContext.setAudioURL;

  const parameters = props.parameters || {};
  const content = parameters?.content || {};

  const containerRef = useRef(null);
  const dropdownRef = useRef(null);
  const startTime = useRef(null);
  const [feedbackVideoData, setFeedbackVideoData] = useState(null);
  const [hintData, setHintData] = useState('');

  if (!content.dropdowns) return null;

  const controls = useAnimation();
  const isVisible = useIsVisible(containerRef);
  const feedbackVideoRef = useRef();
  const [activeDropdowns, setActiveDropdowns] = useState([]);
  const [feedbackParams, setFeedbackParams] = useState({});
  const [ddlClass, setDdlClass] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [isOpen, setIsOpen] = useState([]);
  const [options, setOptions] = useState([]);
  const [lastGame, setLastGame] = useState(false);

  const audioData = {
    url: content.mainQuestionAudio,
    autoplay: true,
    id: parameters.id || 0
  };

  useEffect(() => {

    const selected = chooseUniqueItems(content.dropdowns, 2);

    setActiveDropdowns(selected);

    const initOptions = selected.map(dd =>
      dd.shuffle ? shuffle(dd.options) : dd.options
    );

    setOptions(initOptions);

    setSelectedItems(Array(selected.length).fill(""));

    setIsOpen(Array(selected.length).fill(false));

    setDdlClass(Array(selected.length).fill(""));

  }, [content]);

  const allAnswered = selectedItems.filter(Boolean).length === activeDropdowns.length;

  const renderBgImage = () => {
    const first = findStatusByIndex(pageContext.tocState, 0);
    const second = findStatusByIndex(pageContext.tocState, 1);

    return (
      (first === "correct" ? "1" : "0") +
      (second === "correct" ? "1" : "0")
    );
  };

  const getFeedbackVideo = () => {

    async function loadFeedbackVideo() {
    
      const anim = await getAnimationAsync(
        `mission2_${renderBgImage()}`
      );

      setFeedbackVideoData(anim);
    }

    loadFeedbackVideo();
  }

  const findStatusByIndex = (state, index) => {
    const item = Object.values(state || {}).find(
      (el) => el.index === index
    );
    return item ? item.status : null;
  };

  const checkAnswers = (type) => {

    let feedbackData = {};
    let newDdlClass = [...ddlClass];

    let correctCount = 0;

    let answers = [];

    selectedItems.forEach((answer, index) => {

      if (answer === activeDropdowns[index].correct) {

        correctCount++;

        newDdlClass[index] = "correct disable-ddl";

      } else {

        newDdlClass[index] = "incorrect disable-ddl";
      }

      const ddAnswer = {
        item: {
          id: activeDropdowns[index].id,
          content: {
            text: answer
          }
        }
      };

      answers.push(ddAnswer);
    });

    const isCorrect = correctCount === activeDropdowns.length;

    const tocIndex = content.index;

    const newTocState = pageContext.tocState;

    newTocState.push({
      index: tocIndex,
      status: isCorrect ? "correct" : "incorrect"
    });

    pageContext.setTocState(newTocState);

    setDdlClass(newDdlClass);

    feedbackData = {
      class: isCorrect ? "correct" : "incorrect",
      message: isCorrect ? content.feedback?.correct?.text : content.feedback?.incorrect?.text,
      answers: answers,
      result: isCorrect ? "correct" : "incorrect",
      startTime: startTime.current,
      isCorrect: isCorrect,
      audio: isCorrect ? content.feedback?.correct?.audio : content.feedback?.incorrect?.audio
    };

    setFeedbackParams(feedbackData);

    getFeedbackVideo();

    return { feedbackData };
  };

  const replaceTextWithDropdown = () => {

    return activeDropdowns.filter(dropdown => dropdown?.dropText).map((dropdown, index) => {

        const text = dropdown?.dropText || "";

        const splitParts = text.split("@_@");

        return (
          <div key={dropdown.id} className="single-drop-text">
            {splitParts.map((part, partIndex) => (
              <React.Fragment key={partIndex}>
                <span dangerouslySetInnerHTML={{ __html: part }} />
                {partIndex < splitParts.length - 1 && dropDownContainer(index)}
              </React.Fragment>
            ))}
          </div>
        );
      });
  };

  const dropDownContainer = (index) => (

    <div
      className={`dropdown-container ${
        ddlClass[index] || (selectedItems[index] ? "ddSelected" : "")
      }`}
      ref={dropdownRef}
      onClick={() => handleToggleDropdown(index)}
    >

      <div className="dropdown-value">
        {selectedItems[index] || 'اختر'}
      </div>

      {ddlClass[index] === "correct disable-ddl" && (
        <>
          <div className="symbolHolder">
            <CheckRounded className="me-3" />
          </div>
          <ShowCorrectStars />
        </>
      )}

      <div className="dropdown-arrow-container">

        <svg
          className={`dropdown-arrow ${isOpen[index] ? 'rotated' : ''}`}
          viewBox="0 0 20.99 11.91"
          width="20"
          height="20"
        >
          <path d="M1.41,0H19.58a1.41,1.41,0,0,1,1,2.41l-9.08,9.08a1.41,1.41,0,0,1-2,0L.42,2.41A1.41,1.41,0,0,1,1.41,0Z" />
        </svg>

      </div>

      {isOpen[index] && (

        <div className="dropdown-options opened bottom">

          {options[index]?.map((option) => (

            <div
              key={option}
              className="dropdown-option"
              onClick={() => handleOptionSelect(option, index)}
            >
              {option}
            </div>

          ))}

        </div>

      )}

    </div>
  );

  const handleToggleDropdown = (index) => {
    const newIsOpen = Array(activeDropdowns.length).fill(false);
    newIsOpen[index] = !isOpen[index];

    if (newIsOpen[index]) {
      setAudioURL({ id: "ddOpen", url: ddOpen, type: "sfx" });
    } else {
      setAudioURL({ id: "ddClose", url: ddClose, type: "sfx" });
    }

    setIsOpen(newIsOpen);
  };

  const handleOptionSelect = (value, index) => {
    const newSelectedItems = [...selectedItems];
    newSelectedItems[index] = value;

    setSelectedItems(newSelectedItems);

    setIsOpen(Array(activeDropdowns.length).fill(false));
  };

  const handleClickOutside = (event) => {
    if (!event.target.closest(".dropdown-container")) {
      setIsOpen(Array(activeDropdowns.length).fill(false));
    }
  };

  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () =>
      document.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isVisible) {
      controls.start("animate");
      startTime.current = Date.now();
    } else {
      controls.start("initial");
    }
  }, [isVisible]);

  useEffect(() => {
    if (feedbackVideoData && feedbackVideoRef.current) {      
      feedbackVideoRef.current.play();
    }
  }, [feedbackVideoData]);

  return (
    <div className="dropdownList-container w-100 component-container"
          style={{
           backgroundImage: `url(images/train_bg_${renderBgImage()}.png)`,
         }}>

      <HintButton hintData={content.hintData} setHintData={setHintData} />

      <GoToTOCButton showResults={content.showResult} />

      {feedbackVideoData && 
          <video ref={feedbackVideoRef} className='feedbackVideo' src={feedbackVideoData} poster={`images/train_bg_${renderBgImage()}.png`}/>
      }

      <motion.div ref={containerRef} className="dropdownList-wrapper w-100 component-content" variants={getAnimation("blurIn", 0.8, 0)} initial="initial" animate={controls}>
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

        <motion.div className="drop-text-panel" variants={getAnimation("scaleIn", 0.6, 0.7)} initial="initial" animate={controls}>
          <div className="drop-text-dropdown">
            {replaceTextWithDropdown()}
          </div>
        </motion.div>

        {allAnswered && (
          <div className="feedback-container-holder">
            <Feedback
              feedback={feedbackParams}
              submitLimit={content.submitLimit}
              handleSubmit={checkAnswers}
            />
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default DropdownList;