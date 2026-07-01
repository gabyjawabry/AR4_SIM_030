import React, { useState, useEffect, useRef, useContext} from "react";
import { motion, useAnimation } from "framer-motion";
import { PageContext } from "../../../container/js/utilities/context";
import { getAnimation , useIsVisible} from "../../../container/js/utilities/utilities";
import { Button } from "react-bootstrap";
import AudioWidget from '../../../container/js/audioWidget';
import { getAnimationAsync } from '../../../container/js/utilities/helper.jsx';
import { Col, Row } from 'react-bootstrap';
import "../css/userNamePage.scss";

const UserNamePage = (props) => {
  const content = props?.parameters?.content || {};
  const pageContext = useContext(PageContext);
  const { setUserName, setAudioURL, stopAudio } = useContext(PageContext);
  const containerRef = useRef(null);
  const audioData = {
    url: props?.parameters?.mainQuestionAudio,
    autoplay: true,
    id: props?.parameters?.id || 0
  };
  const [name, setName] = useState("");
  const [animationsCompleted, setAnimationsCompleted] = useState(false);
  const controls = useAnimation();
  const isVisible = useIsVisible(containerRef);
  const handleSubmit = (e) => {
     stopAudio();
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) return;
    setUserName(trimmedName);
    const swiper = document.querySelector('#container-swiper')?.swiper;
    if (swiper) swiper.slideTo(2, 1);
  };
    useEffect(() => {
    if (isVisible) {      
      controls.start("animate");
    }else{
      controls.start("initial");
    }
  }, [isVisible]);

  return (
    <div className="unp-component-container component-container w-100 h-100 d-flex flex-column align-items-center justify-content-center">
        <motion.div ref={containerRef}  className="mainTypeNameHolder d-flex flex-column " variants={getAnimation("blurIn", 0.8, 1)} initial="initial" animate={controls}>
              <div  className="mainTextInputHolder">
                <div  className="textInputHolder">
                <div className="questionText">
                  <Row className="cap-help-container mb-0 mx-3">
                    <Col className="d-flex align-items-center justify-content-start col-1 p-0">
                      <AudioWidget data={audioData} audioType="main-question" />
                    </Col>
                  </Row>
               اكتبْ اسمَكَ لِتبدأَ مهمّةَ القيادة، ثمَّ انقرْ على زرِّ تأكيدٍ:
              </div>

              <div className="typeNameHolder">
                <span className="typeNameHolderText">الاسم:</span>

                <input
                  type="text"
                  placeholder="اكتب اسمك هنا..."
                  value={name}
                   onChange={(e) => {
                    console.log(e.target.value);
                    setName(e.target.value);
                  }}
                  maxLength={30}
                  className="typeinInputField"
                  
                />
                </div>
              </div>
              </div>
                <div className="next-screen-btn-holder  w-100 h-100 d-flex flex-column align-items-center ">

                <Button
                  type="button"
                  className="next-screen-btn"
                  onClick={handleSubmit}
                  disabled={!name.trim()}
                >
                  تأكيد
                </Button>
                </div>          
        </motion.div>
      {/* </div> */}
    </div>
  );
};

export default UserNamePage;