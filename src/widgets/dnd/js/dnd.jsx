import React, { useState, useEffect, useRef, useContext  } from 'react';
import "../css/dnd.scss";
import AudioWidget from '../../../container/js/audioWidget.jsx';
import { Col, Row } from 'react-bootstrap';
import { motion, useAnimation } from "framer-motion";
import DraggableItem from './DraggableItem.jsx';
import DroppableItem from './DroppableItem.jsx';
import DropTextInline from './DropTextInline.jsx';
import GoToTOCButton from '../../../container/js/showTOCBtn.jsx';
import HintButton from '../../../container/js/hintButton.jsx';
import Lottie from "lottie-react";
import { getAnimation, shuffle, useIsVisible } from "../../../container/js/utilities/utilities.jsx";
import { getAnimationAsync } from '../../../container/js/utilities/helper.jsx';
import { createPortal } from "react-dom";
import { PageContext } from "../../../container/js/utilities/context.jsx";
import { DndContext, useDndMonitor } from '@dnd-kit/core';
import Feedback from '../../../container/js/feedback.jsx';
import DropSFX from '../sounds/drop.mp3';
import CorrectSFX from '../sounds/gauge_correct.mp3';
import IncorrectSFX from '../sounds/gauge_incorrect.mp3';

const DndInner = ({ droppableRefs, selectedAnswers, setSelectedAnswers, setActiveId, setUsedItems, usedItems }) => {
  const { setAudioURL } = useContext(PageContext);
  useDndMonitor({
    onDragStart(e) {
      setActiveId(e.active.id);
    },

    onDragEnd(e) {
      setActiveId(null);
      if (!e.over) return;

      // prevent duplicates
      if (usedItems.includes(e.active.id)) return;

      const droppableIndex = e.over.data.current?.index;
      if (typeof droppableIndex !== "number") return;

      const droppable = droppableRefs.current[droppableIndex];
      if (!droppable) return;

      const oldItems = droppable.getDroppedItems?.() || [];

      if (oldItems.length > 0) {
        droppable.reset();

        setUsedItems(prev =>
          prev.filter(id => !oldItems.some(item => item.id === id))
        );
      }

      const dragData = e.active.data.current || {};

      const droppedItem = {
        id: e.active.id,
        value: dragData.value,
        type: dragData.type,
        dataIndex: dragData.dataIndex,
        droppableItem: {
          id: e.over.data.current?.id,
          index: e.over.data.current?.index
        } 
      };

      droppable.addDroppedItem(droppedItem);

      setAudioURL({id: "drop", url: DropSFX, type: "sfx"});

      setSelectedAnswers(prev => {
        const copy = [...prev];
        copy[droppableIndex] = e.active.id;
        return copy;
      });

      setUsedItems(prev => [...new Set([...prev, e.active.id])]);
    }
  });

  return null;
};

const dnd = ({  parameters, index, handleCheckAnswer }) => {
  const content = parameters?.content || {};
  const mainHolderControls = useAnimation();
  const containerRef = useRef(null);
  const textRef = useRef(null);
  const controls = useAnimation();
  const [mainHolderVisible, setMainHolderVisible] = useState(true);
  const isVisible = useIsVisible(containerRef);
  const [currentRound, setCurrentRound] = useState(0);
  const audioData = { url: content.mainQuestionAudio, autoplay: true, id: parameters.id || 0 };
  const roundsRef = useRef(null);
  const [feedbackAnimationData, setFeedbackAnimationData] = useState(null);
  const pageContext = useContext(PageContext);
  const [roundData, setRoundData] = useState(null);
  const [usedItems, setUsedItems] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState([]);
  const [feedbackParams, setFeedbackParams] = useState({});
  const [droppableClasses, setDroppableClasses] = useState([]);
  const [showDraggables, setShowDraggables] = useState(false);
  const [hintData, setHintData] = useState('');
  const droppableRefs = useRef([]);
  const feedbackSubmitButtonRef = useRef();
  const startTime = useRef(null);
  const dndData = content.rounds[currentRound];

  const renderBgImage = () => {
    const first = findStatusByIndex(pageContext.tocState, 0);
    const second = findStatusByIndex(pageContext.tocState, 1);

    return (
      (first === "correct" ? "1" : "0") +
      (second === "correct" ? "1" : "0")
    );
  };

  const findStatusByIndex = (state, index) => {
    const item = Object.values(state || {}).find(
      (el) => el.index === index
    );
    return item ? item.status : null;
  };

  const renderMedia = () => {

    if(feedbackAnimationData){
      return (
        <Lottie
          className="character_animation"
          animationData={feedbackAnimationData}
          loop
          autoplay
        />
      );
    }  

    return (
      <img
        src={`images/gauge.png`}
        alt="gauge"
        className="character_animation"
      />
    );
  };

  useEffect(() => {
    if (isVisible) {      
      startTime.current = Date.now();
      controls.start("animate");
    }else{
      controls.start("initial");
    }
  }, [isVisible]);
  
  useEffect(() => {
    if(dndData){
      const object1 = shuffle(
        (dndData.draggableItems || []).filter(
          item => item.dataIndex === "object_1"
        ))
      .slice(0, 2);

      const object2 = shuffle(
        (dndData.draggableItems || []).filter(
          item => item.dataIndex === "object_2"
        )
      ).slice(0, 2);

      const finalDraggables = shuffle([
        ...object1,
        ...object2
      ]);

      setRoundData({
        ...dndData,
        draggableItems: finalDraggables
      });
      setSelectedAnswers([]);
      setUsedItems([]);
      setDroppableClasses([]);
      setFeedbackParams({});
      droppableRefs.current = [];

      setShowDraggables(false);
      setTimeout(() => setShowDraggables(true), 300);
    }

  }, [dndData]);

  const filledAnswers = selectedAnswers.filter(ans => ans);
  const allItemsDropped = roundData?.droppableItems?.length === filledAnswers.length;

  const getFeedbackAnimation = () => {

    async function loadFeedbackAnimation() {
      
      const status = findStatusByIndex(pageContext.tocState, 2);

      const anim = await getAnimationAsync(
        `gauge${status === "correct" ? "Win" : "Fail"}`
      );

      setFeedbackAnimationData(anim);
    }

    loadFeedbackAnimation();
  }

  const checkAnswers = (type) => {
    let feedbackData = {};
    let answers = [];

    if (["tryagain", "reset"].includes(type)) {
      droppableRefs.current.forEach(d => d?.reset?.());
      setSelectedAnswers([]);
      setUsedItems([]);
      setDroppableClasses([]);
      setFeedbackParams({});
      return;
    }

    let correct = 0;
    let classes = [];

    selectedAnswers.forEach((ans, i) => {
      const drag = roundData.draggableItems?.find(d => d.id === ans);
      const drop = roundData.droppableItems?.[i];

      if (drag?.dataIndex === drop?.dataIndex) {
        correct++;
        classes[i] = "correct";
      } else {
        classes[i] = "incorrect";
      }

      const answer = {
        item: {
          id: drag.id,
          content: {
            text: drag.value
          }
        },
        droppedId: drop.id
      };
      answers.push(answer);
    });

    setDroppableClasses(classes);

    const isCorrect = correct === roundData.droppableItems.length;

    const tocIndex = content.index; 
    const newTocState = pageContext.tocState;
    newTocState.push({
      index: tocIndex,
      status: isCorrect ? "correct" : "incorrect"
    });
    pageContext.setTocState(newTocState);
    
    feedbackData = {
      class: isCorrect ? "correct" : "incorrect",
      message: isCorrect ? roundData.feedback?.correct?.text : roundData.feedback?.incorrect?.text,
      answers: answers,
      result: isCorrect ? "correct" : "incorrect",
      startTime: startTime.current,
      isCorrect: isCorrect,
      audio: isCorrect ? roundData.feedback?.correct?.audio : roundData.feedback?.incorrect?.audio,
      sfx: isCorrect ? CorrectSFX : IncorrectSFX
    };

    setFeedbackParams(feedbackData);

    getFeedbackAnimation();

    return { feedbackData };
  };

  return ( 
      <div className="dnd-container component-container w-100"
       style={{
           backgroundImage: `url(images/mission03_train_bg_${renderBgImage()}.png)`,
         }}>
              <HintButton
        hintData={content.hintData}
        setHintData={setHintData}
      />
        <GoToTOCButton />
        <motion.div ref={containerRef} className="dnd-wrapper w-100 component-content" variants={getAnimation("blurIn", 0.8, 0)} initial="initial" animate={controls}>
          <motion.div className="mainQuestionHolderDiv">
          <motion.div className="mainQuestionHolder" variants={getAnimation("slideDown", 0.6, 0.4)} initial="initial" animate={controls}>
              <Row className="audio-help-container mb-0 mx-0">
                <Col className="d-flex align-items-center justify-content-start col-1 p-0">
                  <AudioWidget data={audioData} audioType="main-question" />
                </Col>
              </Row>
            <motion.div className="mainQuestion" dangerouslySetInnerHTML={{ __html: content.mainQuestion }}/>
            </motion.div>
          </motion.div>
         <motion.div className="text-row" variants={getAnimation("scaleIn", 0.6, 0.7)} initial="initial" animate={controls}>
            <motion.div className="text-col w-10" variants={getAnimation("slideRight", 0.6, 1.1)} initial="initial" animate={controls}>
              <div className="dnd-content" ref={containerRef}>
                <motion.div  className="dnd-wrapper" {...getAnimation("blurIn", 0.6, 1)}>
                  <DndContext>
                    <div className="dropTextHolder">
                      <DropTextInline
                        dropText={roundData?.dropText}
                        droppableItems={roundData?.droppableItems}
                        droppableClasses={droppableClasses}
                        droppableRefs={droppableRefs}
                        setUsedItems={setUsedItems}
                      />
                    </div>
                    {showDraggables && (
                      <div className="draggable-container">
                        {roundData?.draggableItems.map(item => (
                            <motion.div key={item.id} {...getAnimation("zoomIn", 0.4, 0)}>
                            <DraggableItem
                              id={item.id}
                              type={item.type}
                              value={item.value}
                              dataIndex={item.dataIndex}
                              cssClass = {`draggable-item ${droppableClasses.length > 0 ? 'disabled' : ''}`}
                              isDragging={activeId === item.id}
                              isUsed={usedItems.includes(item.id)}
                            />
                          </motion.div>
                        ))}
                      </div>
                    )}

                    <DndInner
                      droppableRefs={droppableRefs}
                      selectedAnswers={selectedAnswers}
                      setSelectedAnswers={setSelectedAnswers}
                      setActiveId={setActiveId}
                      setUsedItems={setUsedItems}
                      usedItems={usedItems}
                    />

                  </DndContext>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
          {allItemsDropped && (
            <div className="feedback-container-holder">
              <Feedback
                feedback={feedbackParams}
                submitLimit={roundData?.submitLimit}
                handleSubmit={checkAnswers}
                ref={feedbackSubmitButtonRef}
              />
            </div>
          )}
        </motion.div>
        <div className="character-lighting-container">
            <motion.div className={`character_${content.characterImage}`} variants={getAnimation("slideUp", 1, 1.8)} initial="initial" animate={controls}>
                {renderMedia(content.characterImage)}
            </motion.div>
        </div>
      </div>
  );
};

export default dnd;
