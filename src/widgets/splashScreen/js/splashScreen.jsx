import { motion, useAnimation, useScroll } from "framer-motion";
import {  useContext, useEffect, useState, useRef } from 'react';
import { FormattedMessage } from "react-intl";
import '../css/splashScreen.scss';
import { getAnimation, useIsVisible } from "../../../container/js/utilities/utilities";
import { PageContext } from "../../../container/js/utilities/context";
import { getAnimationAsync } from '../../../container/js/utilities/helper.jsx';
import startSFX from '../sounds/start.mp3';
import achievementSFX from '../sounds/achievement.mp3';
import VideoPlayer from "../../videoPlayer/js/videoPlayer.jsx";
import ScoreCircle from '../../../container/js/scoreCircle.jsx';

const SplashScreen = ({parameters}) => {
  const { content } = parameters;
  const controls = useAnimation();
  const containerRef = useRef(null);
  const isVisible = useIsVisible(containerRef);
  const { setAudioURL, stopAudio, avatarSelected, userName, studentGrade} = useContext(PageContext);
  const [startAnimation, setStartAnimation] = useState(false);
  const videoPlayerRef = useRef();
  const videoParams = {
    videoData: {
      url: content.backgroundVideoData?.url,
      poster: content.backgroundVideoData?.poster,
      autoplay: true,
      preview: false,
      showEndOverlay: false,
      controls: {
        control_bar: false,
        cc: false,
        show_duration: false,
        show_time: false,
        volume_control: false,
        seekbar: false,
        fullscreen: false,
        video_speed: false,
      }
    }
  };
  const handleStartAnimations = async () => {
    stopAudio();
    const swiper = document.querySelector('#container-swiper')?.swiper;
    if (swiper) swiper.slideNext(1);
  };

  useEffect(() => {
    if(content.audio){
      setAudioURL({id: "splashScreen", url: !content.achievement ? startSFX : achievementSFX, type: "splashScreenSFX"}, () => {
        setAudioURL({id: "splashScreen", url: content.audio, type: "splashScreenSFX"});
        setStartAnimation(true);
      });
    }

    return () => {
      stopAudio();
    };
  }, [content.audio, content.achievement, setAudioURL, stopAudio]);
    useEffect(() => {
      console.log(avatarSelected);
    if (isVisible) {      
      controls.start("animate");
    }else{
      controls.start("initial");
    }
  }, [isVisible]);
  return (
    <div className="splashScreen-container p-0 m-0 h-100 w-100">
      <div className="splashScreen-content w-100">
          <motion.div className="avatarImageNameHolder" variants={getAnimation("bounce", 0.6, 0.4)} initial="initial" animate={controls}>
            <img src={`../images/${avatarSelected}_selected.png`} alt="Selected Avatar" className="selected-avatar-image" />
            <div className="UserNameText" dangerouslySetInnerHTML={{ __html: userName }} />
          </motion.div>
          <motion.div className="studentGradeHolder" variants={getAnimation("flipX", 0.6, 0.8)} initial="initial" animate={controls}>
            <ScoreCircle score={studentGrade} />
          </motion.div>
      {content.backgroundVideoData  && (
          <VideoPlayer className="videoSplashScreen"
            parameters={videoParams}
            autoplay={true}
            ref={videoPlayerRef}
          />
        )}
        <motion.div ref={containerRef}  className={`lessonTitleHolder ${content.last ? 'last' : ''}`}    variants={getAnimation("bounceInTop", 0.4, 1)} initial="initial" animate={controls}>
          

          
          <div className="splashScreen-content-wrapper">
            <div className="splashScreen-content-titles">
              <motion.div
                {...getAnimation("expandIn", 0.8, 1)}
                className="lessonTitle"
                dangerouslySetInnerHTML={{ __html: content.lessonTitle }}
              ></motion.div>
              
              {content.lessonSubTitle && (<motion.div
                {...getAnimation("bounce", 0.8, 1)}
                className="lessonSubTitle"
                 dangerouslySetInnerHTML={{ __html: content.lessonSubTitle }}
              ></motion.div>)}
            </div>

            <motion.div
              className="startLessonBtnHolder"
              {...getAnimation("scaleIn", 0.4, 1)}
            >
              <button
                className="startLessonBtn"
                onClick={handleStartAnimations}
              >
                {!content.achievement ? (
                  <FormattedMessage id="splashScreen.start" />
                ) : (
                  <FormattedMessage id="splashScreen.next" />
                )}
              </button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SplashScreen;
