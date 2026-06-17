import { motion, useAnimation, useScroll } from "framer-motion";
import {  useContext, useEffect, useState, useRef } from 'react';
import { FormattedMessage } from "react-intl";
import '../css/splashScreen.scss';
import { getAnimation } from "../../../container/js/utilities/utilities";
import { PageContext } from "../../../container/js/utilities/context";
import startSFX from '../sounds/start.mp3';
import achievementSFX from '../sounds/achievement.mp3';
import VideoPlayer from "../../videoPlayer/js/videoPlayer.jsx";

const SplashScreen = ({parameters}) => {
  const { content } = parameters;
  const controls = useAnimation();
  const { setAudioURL, stopAudio } = useContext(PageContext);
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

  return (
    <motion.div
      className="splashScreen-container p-0 m-0 h-100 w-100"
      {...getAnimation("fade", 0.4, 0)}
    >
      <div className="splashScreen-content w-100">

        {content.backgroundVideoData  && (
          <VideoPlayer className="videoSplashScreen"
            parameters={videoParams}
            autoplay={true}
            ref={videoPlayerRef}
          />
        )}
        <motion.div {...getAnimation("bounceInTop", 0.4, 1)} className={`lessonTitleHolder ${content.last ? 'last' : ''}`}>
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
    </motion.div>
  );
};

export default SplashScreen;
