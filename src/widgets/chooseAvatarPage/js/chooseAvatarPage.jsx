import React, { useState, useEffect, useRef, useContext} from "react";
import { motion, useAnimation } from "framer-motion";
import { PageContext } from "../../../container/js/utilities/context";
import { getAnimation , useIsVisible} from "../../../container/js/utilities/utilities";
import { Button } from "react-bootstrap";
import { getAnimationAsync } from '../../../container/js/utilities/helper.jsx';
import "../css/chooseAvatarPage.scss";
import ButtonClickSFX from "../sounds/button_click.mp3";
const chooseAvatarPage = (props) => {
  const avatars = props?.parameters?.avatars || [];
  const pageContext = useContext(PageContext);
  const { setUserName } = useContext(PageContext);
  const containerRef = useRef(null);
  const { setAvatarSelected } = useContext(PageContext);
  const [selected, setSelected] = useState(null);
  const [animationsCompleted, setAnimationsCompleted] = useState(false);
  const { setAudioURL } = useContext(PageContext);
  const controls = useAnimation();
  const isVisible = useIsVisible(containerRef);
  const handleSubmit = () => {
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
              <div  className="mainTextHolde">
                اخترِ الشّخصيّةَ الّتي سَتُمَثِّلُكَ في قيادةِ الفريقِ.
              
              </div>

              <div className="avatarHolder d-flex flex-column align-items-center justify-content-center">
                        <div className="avatars-options">
                          {avatars.map((avatar) => {
                            const isSelected = selected === avatar.id;

                            return (
                              <button
                                key={avatar.id}
                                className={`avatar-option ${
                                  isSelected ? "selected" : ""
                                }`}
                                onClick={() => {
                                  setSelected(avatar.id);
                                  setAvatarSelected(avatar.id);

                                  setAudioURL({
                                    id: "optionClick",
                                    url: ButtonClickSFX,
                                    type: "sfx",
                                  });
                                }}
                              >
                                <img
                                  src={avatar.image}
                                  alt={avatar.id}
                                  className="avatar-image"
                                />
                              </button>
                            );
                          })}
                        </div>   


    <div className="next-screen-btn-holder  w-100 h-100 d-flex flex-column align-items-center justify-content-center">

                <Button
                  type="button"
                  className="next-screen-btn"
                  onClick={handleSubmit}
                 disabled={!selected}
                >
                  تأكيد
                </Button>
                </div>

              </div>


        </motion.div>
      {/* </div> */}
    </div>
  );
};

export default chooseAvatarPage;