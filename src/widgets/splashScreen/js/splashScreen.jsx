import { motion, useAnimation, useScroll } from "framer-motion";
import { useContext, useEffect, useState  } from 'react';
import { FormattedMessage } from "react-intl";
import '../css/splashScreen.scss';
import { getAnimation } from "../../../container/js/utilities/utilities";
import { PageContext } from "../../../container/js/utilities/context";
import startSFX from '../sounds/start.mp3';
import achievementSFX from '../sounds/achievement.mp3';
import mainStarImg from "../images/mainStar.png";
import bigStarImg from "../images/bigStar.png";
import smallStarImg from "../images/smallStar.png";
import achievementImg from "../images/achievement.png";
import Lottie from 'lottie-react';

const SplashScreen = ({parameters}) => {
  const { content } = parameters;
  const controls = useAnimation();
  const { setAudioURL, stopAudio } = useContext(PageContext);
  const [startAnimation, setStartAnimation] = useState(false);

  // Get character animation data based on content id
  //const characterAnimation = content.id ? CharacterData[content.id] : null;

  const handleStartAnimations = async () => {
    // Step 1: trigger zoom-out animation on the whole screen
    // await controls.start({
    //   scale: 0,
    //   opacity: 0,
    //   transition: { duration: 1, ease: "easeInOut" },
    // });
    stopAudio();
    // Step 2: move to next slide after animation ends
    const swiper = document.querySelector('#container-swiper')?.swiper;
    if (swiper) swiper.slideNext(1);
  };

  // useEffect(() => {
  //   if(content.audio){
  //     setAudioURL({id: "splashScreen", url: !content.achievement ? startSFX : achievementSFX, type: "splashScreenSFX"}, () => {
  //       setAudioURL({id: "splashScreen", url: content.audio, type: "splashScreenSFX"});
  //     });
  //   }
  // }, []);

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
        <motion.div {...getAnimation("bounceInTop", 0.4, 1)} className={`lessonTitleHolder ${content.last ? 'last' : ''}`}>
          <div className="splashScreen-content-wrapper">
            {!content.achievement ? 
              <div className="UpperDiv">
                <motion.div {...getAnimation("rotateZoomIn", 0.8, 1)} className="smallStarRight">
                  <img src={smallStarImg} alt="small star" />
                </motion.div>
                <motion.div {...getAnimation("rotateZoomIn", 0.8, 1)}>
                  <img src={bigStarImg} alt="big star" />
                </motion.div>
                <motion.div {...getAnimation("rotateZoomIn", 0.8, 1)}>
                  <img src={mainStarImg} alt="main star" />
                </motion.div>
                <motion.div {...getAnimation("rotateZoomIn", 0.8, 1)}>
                  <img src={bigStarImg} alt="big star" />
                </motion.div>
                <motion.div {...getAnimation("rotateZoomIn", 0.8, 1)} className="smallStarLeft">
                  <img src={smallStarImg} alt="small star" />
                </motion.div>
              </div>
              : 
              <div className="UpperDiv achievement">
                <motion.div {...getAnimation("rotateZoomIn", 0.8, 1.5)} className="bigStarLeft1">
                  <img src={bigStarImg} alt="big star" />
                </motion.div>
                <motion.div {...getAnimation("rotateZoomIn", 0.8, 1.4)} className="bigStarLeft2">
                  <img src={bigStarImg} alt="big star" />
                </motion.div>
                <motion.div {...getAnimation("rotateZoomIn", 0.8, 1.2)} className="smallStarLeft1">
                  <img src={smallStarImg} alt="small star" />
                </motion.div>
                <motion.div {...getAnimation("expandIn", 0.8, 1)} className="goggles">
                  <img src={achievementImg} alt="goggles" />
                </motion.div>
                <motion.div {...getAnimation("rotateZoomIn", 0.8, 1.3)} className="smallStarRight1">
                  <img src={smallStarImg} alt="small star" />
                </motion.div>
                <motion.div {...getAnimation("rotateZoomIn", 0.8, 1.4)} className="smallStarRight2">
                  <img src={smallStarImg} alt="small star" />
                </motion.div>
                <motion.div {...getAnimation("rotateZoomIn", 0.8, 1.5)} className="bigStarRight1">
                  <img src={bigStarImg} alt="big star" />
                </motion.div>
              </div>
            }
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
            {
              !content.last ? 
                <motion.div
                  className="startLessonBtnHolder"
                  {...getAnimation("scaleIn", 0.4, 1)}
                >
                  <button className="startLessonBtn" onClick={handleStartAnimations}>
                    {!content.achievement ? 
                      <FormattedMessage id='splashScreen.start' />
                      :
                      <FormattedMessage id='splashScreen.next' />
                    }
                  </button>
                </motion.div>
              :
                <></>
            }
          </div>
        </motion.div>
        {/* <Lottie
          className="characterAnimation"
          animationData={groovyWalkAnimation}
          loop={false}
          autoplay={true}
        /> */}
        {/* {content.character && startAnimation && characterAnimation && (
          <Lottie
            className="characterAnimation"
            animationData={characterAnimation}
            loop={false}
            autoplay={true}
          />
        )} */}
      </div>
    </motion.div>
  );
};

export default SplashScreen;
