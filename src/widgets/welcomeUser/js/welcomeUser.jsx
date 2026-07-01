import React, { useState, useEffect, useRef, useContext} from "react";
import { FormattedMessage } from "react-intl";
import { motion, useAnimation } from "framer-motion";
import { PageContext } from "../../../container/js/utilities/context";
import { getAnimation , useIsVisible} from "../../../container/js/utilities/utilities";
import { Button } from "react-bootstrap";
import { getAnimationAsync } from '../../../container/js/utilities/helper.jsx';
import "../css/welcomeUser.scss";

const welcomeUser = (props) => {
  const content = props?.parameters?.content || {};
  const { mainQuestion, mainQuestionAudio } = content;
  const { userName } = useContext(PageContext);
  const containerRef = useRef(null);
  const [animationsCompleted, setAnimationsCompleted] = useState(false);
  const controls = useAnimation();
  const isVisible = useIsVisible(containerRef);

  const handleNextScreen = () => {
    const swiper = document.querySelector('#container-swiper')?.swiper;
    if (swiper) swiper.slideTo(3, 1);
  };

  useEffect(() => {
    if (isVisible) {      
      controls.start("animate");
    }else{
      controls.start("initial");
    }
  }, [isVisible]);

  return (
    <div className="wu-component-container component-container w-100 h-100 d-flex flex-column align-items-center justify-content-center">
        <motion.div ref={containerRef}  className="mainShowNameHolder d-flex flex-column " variants={getAnimation("slideDown", 0.8, 0)} initial="initial" animate={controls}>
          <div className="showNameHolder">
            <span className="showNameHolderText" dangerouslySetInnerHTML={{ __html: mainQuestion }} />
            <span className="UserNameText" dangerouslySetInnerHTML={{ __html: userName }} />
            <div className="next-screen-btn-holder  w-100 h-100 d-flex flex-column align-items-center justify-content-center">
            <Button type="button" className="next-screen-btn" onClick={handleNextScreen}>
              <FormattedMessage id='feedback.continue' />
            </Button>
            </div>
          </div>
        </motion.div>
    </div>
  );
};

export default welcomeUser;