import { motion, useAnimation, useScroll } from "framer-motion";
import {  useContext, useEffect, useState, useRef } from 'react';
import { FormattedMessage } from "react-intl";
import '../css/splashScreen.scss';
import { getAnimation, useIsVisible } from "../../../container/js/utilities/utilities";
import { PageContext } from "../../../container/js/utilities/context";
import { getAnimationAsync } from '../../../container/js/utilities/helper.jsx';
import startSFX from '../sounds/start.mp3';
import VideoPlayer from "../../videoPlayer/js/videoPlayer.jsx";
import ShowAvatarAndName from '../../../container/js/showAvatarAndName.jsx';
import ShowScoring from '../../../container/js/showScoring.jsx';

const SplashScreen = ({parameters}) => {
  const { content } = parameters;
  const controls = useAnimation();
  const containerRef = useRef(null);
  const isVisible = useIsVisible(containerRef);
  const { setAudioURL, stopAudio, avatarSelected, userName, studentGrade} = useContext(PageContext);
  const [startAnimation, setStartAnimation] = useState(false);
  const [backgroundVideoData, setbackgroundVideoData] = useState(null);
  const videoPlayerRef = useRef();
  const backgroundVideoRef = useRef();
// useEffect(() => {
//   if (!avatarSelected || content?.splashIndex == null) return;

//   async function loadBackgroundVideo() {
//     const key = `mission${content.splashIndex}_intro_${avatarSelected}`;

//     const anim = await getAnimationAsync(key);
//     setbackgroundVideoData(anim);
//   }

//   loadBackgroundVideo();
// }, [avatarSelected, content?.splashIndex]);


  useEffect(() => {

  }, [isVisible]);




  const handleStartAnimations = async () => {
    stopAudio();
    const swiper = document.querySelector('#container-swiper')?.swiper;
    if (swiper) swiper.slideNext(1);
  };

  useEffect(() => {


    if(content.audio){
        setAudioURL({id: "splashScreen", url: content.audio, type: "splashScreenSFX"});
       
    }

    return () => {
      stopAudio();
    };
  }, [content.audio, setAudioURL, stopAudio]);


    useEffect(() => {
    async function loadBackgroundVideo() {
      const anim = await getAnimationAsync(`mission${content.splashIndex}_intro_${avatarSelected}`);
      setbackgroundVideoData(anim);
    }  

    if (isVisible) {      
      setStartAnimation(true);  
      loadBackgroundVideo();
      controls.start("animate");
    }else{
      controls.start("initial");
    }
  }, [isVisible]);
  return (
    <div className="splashScreen-container p-0 m-0 h-100 w-100">
      <div className="splashScreen-content w-100">
        <motion.div className="avatarAndScore" variants={getAnimation("flipX", 0.6, 0.4)} initial="initial" animate={controls}>
          <ShowAvatarAndName />
          <ShowScoring />
        </motion.div> 
        <motion.div ref={containerRef}  className="lessonTitleHolder"   variants={getAnimation("bounceInTop", 0.4, 1)} initial="initial" animate={controls}>
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
                ابدأْ
              </button>
            </motion.div>
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
    </div>
  );
};

export default SplashScreen;
