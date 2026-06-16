import React, { useState, useContext, useRef, useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import { FormattedMessage } from "react-intl";
import { PageContext } from "../../../container/js/utilities/context";
import { getAnimationAsync } from "../../../container/js/utilities/helper";
import { getAnimation, useIsVisible } from "../../../container/js/utilities/utilities";
import { Col, Row } from 'react-bootstrap';
import AudioWidget from '../../../container/js/audioWidget';
import ScoreCircle from '../../../container/js/scoreCircle.jsx';
import "../css/toc.scss";
import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/navigation";

import Lottie from "lottie-react";

import ScreenOpenSFX from "../sounds/screen_open.mp3";
import SlideSFX from "../sounds/slide_3.mp3";
import Lock from "../images/lock.svg?react";
import Shadow from "../images/shadow.svg?react";
import NextBtnArrow from "../images/next_mission.svg?react";

const TOC = (props) => {
  const content = props?.parameters?.content || {};
  const slidesData = content.slides || [];

  const { tocState, setAudioURL, stopAudio, avatarSelected, userName, studentGrade} = useContext(PageContext);
  const [hasClicked, setHasClicked] = useState(false);
  const [firstLoad, setFirstLoad] = useState(false);

  const OFFSET = 6;

  const [loadedAnimations, setLoadedAnimations] = useState({});

  const controls = useAnimation();
  const lastMissionControls = useAnimation();

  const containerRef = useRef(null);
  const isVisible = useIsVisible(containerRef);
  const [animationsCompleted, setAnimationsCompleted] = useState(false);
  const isAllMissionsCompleted = [0, 1, 2, 3].every(
    (i) => tocState?.[i]?.status
  );

  const incorrectCount = Object.values(tocState || {}).filter(
    (item) => item.status === "incorrect"
  ).length;

  const handleSlideClick = (slide, index) => {
    const swiper = document.querySelector("#container-swiper")?.swiper;

    setAudioURL({
      id: "screenOpen",
      url: ScreenOpenSFX,
      type: "sfx",
    });

    if (swiper) {
      swiper.slideTo(index + OFFSET, 1);
    }

    setHasClicked(true);
    props?.action?.({ slide, index });
  };

  const getTopText = () => {
    const swiper = document.querySelector('#container-swiper')?.swiper;
    const activeSlideId = swiper?.slides[swiper.activeIndex]?.getAttribute('id');

    if (activeSlideId === "Main_Slide-6"){
      const answeredSlides = Object.values(tocState || {}).filter(
        (s) => s?.status
      ).length;
      return content.mainQuestionArray[answeredSlides];
    }
  };

  const findStatusByIndex = (state, index) => {
    const item = Object.values(state || {}).find(
      (el) => el.index === index
    );
    return item ? item.status : null;
  };

  const getStatusCount = () => {
    const swiper = document.querySelector("#container-swiper")?.swiper;

    const activeSlideId = swiper?.slides?.[swiper.activeIndex]?.getAttribute("id");

    //if (activeSlideId !== "Main_Slide-2") return 0;

    return Object.values(tocState || {}).filter(
      (s) => s?.status
    ).length;
  };

  const renderMedia = (slide, status) => {
    const base = slide.ImageSource;

    if (status === "correct") {
      const anim = loadedAnimations[`${base}Win`];
      if (!anim) return null;

      return (
        <div className="card-image-holder animated">
          <Lottie
            className="toc-image"
            animationData={anim}
            loop
            autoplay
          />
        </div>
      );
    }

    if (status === "incorrect") {
      const anim = loadedAnimations[`${base}Fail`];
      if (!anim) return null;

      return (
        <div className="card-image-holder animated">
          <Lottie
            className="toc-image"
            animationData={anim}
            loop
            autoplay
          />
        </div>
      );
    }

    return (
      <div className="card-image-holder static">
        <img
          src={`images/${base}.png`}
          alt="slide"
          className="toc-image"
        />
      </div>
    );
  };

  // const renderBgImage = () => {
  //   const first = findStatusByIndex(tocState, 0);
  //   const second = findStatusByIndex(tocState, 1);

  //   return (
  //     (first === "correct" ? "1" : "0") +
  //     (second === "correct" ? "1" : "0")
  //   );
  // };
  
  const handleTOCAudio = () => {
    const swiper = document.querySelector("#container-swiper")?.swiper;

    const activeSlideId = swiper?.slides?.[swiper.activeIndex]?.getAttribute("id");

    if (activeSlideId === "Main_Slide-2") {
      const answeredSlides = Object.values(tocState || {}).filter(
        (s) => s?.status
      ).length;

      setAudioURL({
        id: `audio_${answeredSlides + 1}`,
        url: content.mainQuestionAudioArray?.[answeredSlides],
        type: `audio_${answeredSlides + 1}`,
      });
    }
  };

  const handleMissionAchieved = () => {
    stopAudio();
    const swiper = document.querySelector("#container-swiper")?.swiper;
    swiper?.slideTo(6, 1);
  };

  useEffect(() => {
    if (!isVisible) return;

    let mounted = true;

    if (!firstLoad) {
      controls.start("animate");

      setTimeout(() => setAudioURL({id: "fall1", url: SlideSFX, type: "sfx"}), 1000);
      setTimeout(() => setAudioURL({id: "fall2", url: SlideSFX, type: "sfx"}), 2500);
      setTimeout(() => setAudioURL({id: "fall3", url: SlideSFX, type: "sfx"}, () => {
        handleTOCAudio();
        setAnimationsCompleted(true);
      }), 4000);
      
      setFirstLoad(true);
    } else {
     
      handleTOCAudio();
    }

    async function loadAnimations() {
      const tasks = [];

      slidesData.forEach((slide, index) => {
        const status = findStatusByIndex(tocState, index);
        const base = slide.ImageSource;

        if (status === "correct") {
          tasks.push({ key: `${base}Win`, animationKey: `${base}Win` });
        }

        if (status === "incorrect") {
          tasks.push({ key: `${base}Fail`, animationKey: `${base}Fail` });
        }
      });

      const results = await Promise.all(
        tasks.map(async (item) => {
          const anim = await getAnimationAsync(item.animationKey);
          return { key: item.key, anim };
        })
      );

      if (!mounted) return;

      const newAnims = {};

      results.forEach((r) => {
        newAnims[r.key] = r.anim;
      });

      setLoadedAnimations((prev) => ({
        ...prev,
        ...newAnims,
      }));
    }

    loadAnimations();

    return () => {
      mounted = false;
    };
  }, [isVisible, tocState]);
     
  const answeredCount = getStatusCount() || 0;
  const audioData = {
    url: content.mainQuestionAudioArray?.[answeredCount],
    autoplay: true,
    id: `audio_${answeredCount + 1}`,
  };
  
  return (
    <div className="toc-component-container component-container w-100 h-100 d-flex flex-column align-items-center justify-content-center"
      style={{
           backgroundImage: `url(images/toc_bg.png)`,
         }}>

      <div ref={containerRef} className="toc-container w-100 h-100 d-flex flex-column align-items-center">
        <motion.div className="mainQuestionHolderDiv">

            <motion.div className="avatarImageNameHolder" variants={getAnimation("bounce", 0.6, 0.4)} initial="initial" animate={controls}>
              <img src={`../images/${avatarSelected}_selected.png`} alt="Selected Avatar" className="selected-avatar-image" />
              <div className="UserNameText" dangerouslySetInnerHTML={{ __html: userName }} />
            </motion.div>
            <motion.div className="studentGradeHolder" variants={getAnimation("flipX", 0.6, 0.8)} initial="initial" animate={controls}>
              {/* <div className="studentGradeText" dangerouslySetInnerHTML={{ __html: studentGrade }} /> */}
              <ScoreCircle score={studentGrade} />
            </motion.div>
          <motion.div className="mainQuestionHolder" variants={getAnimation("slideDown", 0.6, 0.4)} initial="initial" animate={controls}>
            <Row className="audio-help-container mb-0 mx-0">
              <Col className="d-flex align-items-center justify-content-start col-1 p-0">
                <AudioWidget data={audioData} audioType="main-question" />
              </Col>
            </Row>

            <motion.div className="mainQuestion" dangerouslySetInnerHTML={{ __html: getTopText() }} />
          </motion.div>
        </motion.div>

        <div className="toc-slides-holder w-100 d-flex flex-row align-items-center justify-content-center"
        style={{ pointerEvents: animationsCompleted ? "auto" : "none",}}>
          {slidesData.map((slide, slideIndex) => {
            const status = findStatusByIndex(tocState, slideIndex);
            const isLocked = slideIndex > answeredCount;
            return (
              <motion.div
                key={slideIndex}
                variants={getAnimation("slideLeft", 0.4, 1 + ((slideIndex * 3) / 2 ))}
                initial="initial"
                animate={controls}
                className="toc-slide d-flex flex-column align-items-center justify-content-end"
              >

                <div className="card-wrapper-holder">
                   <div className="shadow-overlay">
                        <Shadow/>
                      </div>
                  <div className={`card-wrapper ${status === "correct" ? "correct" : ""} ${status === "incorrect" ? "incorrect" : ""}`}
                    onClick={() => {
                      if (isLocked) return;
                      handleSlideClick(slide, slideIndex);
                    }}
                  >
                   
                    {/* <div className="card-image-holder">
                      {renderMedia(slide, status)}
                    </div> */}

                    {renderMedia(slide, status)}

                    {isLocked && (
                      <div className="locked-overlay">
                        <Lock />
                      </div>
                    )}

                    <Col className="slide-title text-center pt-2">
                      {slide.title}
                    </Col>
                  
                  </div>
                </ div>

                {slideIndex < 3 && (
                  <motion.div className="next-btn-arrow" variants={getAnimation("slideLeft", 0.4, 1.7 + ((slideIndex * 3) / 2 ))} initial="initial" animate={controls}>
                    <NextBtnArrow />
                  </motion.div>
                )}

              </motion.div>
            );
          })}
        </div>

        {answeredCount === 3 && (
          <div className="achievement-btn-holder">
            <button onClick={handleMissionAchieved}>
              <FormattedMessage id="toc.results" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TOC;