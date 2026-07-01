import React, { useState, useEffect, useRef, useContext} from "react";
import { FormattedMessage } from "react-intl";
import { motion, useAnimation } from "framer-motion";
import { PageContext } from "../../../container/js/utilities/context";
import { getAnimation , useIsVisible} from "../../../container/js/utilities/utilities";
import { Button } from "react-bootstrap";
import AudioWidget from '../../../container/js/audioWidget';
import { getAnimationAsync } from '../../../container/js/utilities/helper.jsx';
import "../css/chooseAvatarPage.scss";
import ButtonClickSFX from "../sounds/button_click.mp3";
import { Col, Row } from 'react-bootstrap';

const chooseAvatarPage = (props) => {
  const content = props?.parameters?.content || {};
  const { mainQuestion, mainQuestionAudio, avatars } = content;
  const pageContext = useContext(PageContext);
  const { setUserName } = useContext(PageContext);
  const containerRef = useRef(null);
  const { setAvatarSelected } = useContext(PageContext);
  const [selected, setSelected] = useState(null);
  const [animationsCompleted, setAnimationsCompleted] = useState(false);
  const { setAudioURL, stopAudio } = useContext(PageContext);
  const controls = useAnimation();
  const isVisible = useIsVisible(containerRef);
  const audioData = {
    url: props?.parameters?.mainQuestionAudio,
    autoplay: true,
    id: props?.parameters?.id || 0
  };

  const handleSubmit = () => {
    stopAudio();
    const swiper = document.querySelector('#container-swiper')?.swiper;
    if (swiper) swiper.slideTo(4, 1);
  };

  useEffect(() => {
    if (isVisible) {      
      controls.start("animate");
    }else{
      controls.start("initial");
    }
  }, [isVisible]);

  return (
    <div className="cap-component-container component-container w-100 h-100 d-flex flex-column align-items-center justify-content-center">
      <motion.div ref={containerRef}  className="mainAvatarHolder d-flex flex-column " variants={getAnimation("blurIn", 0.8, 1)} initial="initial" animate={controls}>
        <div className="mainTextHolder">
          <Row className="cap-help-container mb-0 mx-3">
            <Col className="d-flex align-items-center justify-content-start col-1 p-0">
              <AudioWidget data={audioData} audioType="main-question" />
            </Col>
          </Row>
          <span dangerouslySetInnerHTML={{ __html: mainQuestion }} />
        </div>
        <div className="avatarHolder d-flex flex-column align-items-center justify-content-center">
          <div className="avatars-options">
            {avatars.map((avatar) => {
              const isSelected = selected === avatar.id;
              return (
                <button key={avatar.id} className={`avatar-option ${isSelected ? "selected" : ""}`}
                  onClick={() => {
                    setSelected(avatar.id);
                    setAvatarSelected(avatar.id);
                    setAudioURL({ id: "optionClick", url: ButtonClickSFX, type: "sfx",});
                  }}
                >
                  <img src={avatar.image} alt={avatar.id} className="avatar-image" />
                </button>
              );
            })}
          </div>
          <div className="next-screen-btn-holder  w-100 h-100 d-flex flex-column align-items-center justify-content-center">
            <Button type="button" className="next-screen-btn" onClick={handleSubmit} disabled={!selected}>
              <FormattedMessage id='feedback.confirm' />
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default chooseAvatarPage;