import React, { forwardRef, useImperativeHandle, useState, useEffect, useContext } from 'react';
import { FormattedMessage, useIntl } from "react-intl";
import { Button } from 'react-bootstrap';
import { useSwiper } from 'swiper/react';
import correctSoundEffect from '../audio/correct.mp3';
import incorrectSoundEffect from '../audio/wrong.mp3';
import { PageContext } from "./utilities/context";
import '../css/Feedback.scss';
import { motion, useAnimation } from "framer-motion";
import { getAnimation } from "./utilities/utilities";
import AudioWidget from "./audioWidget";

const Feedback = forwardRef(({ feedback, submitLimit, handleSubmit }, ref) => {
    const intl = useIntl();
    const [submitText, setSubmitText] = useState(intl.formatMessage({ id: 'feedback.submit' }));
    const [submitAction, setSubmitAction] = useState('Submit');
    const [submitButtonState, setSubmitButtonState] = useState(false);
    const [localSubmitCount, setLocalSubmitCount] = useState(0);
    const [showSplash, setShowSplash] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const { setAudioURL } = useContext(PageContext);
    const swiper = useSwiper();
    useImperativeHandle(ref, () => ({
        disableSubmitButton(enable) {
            setSubmitButtonState(enable);
        },
        handleSubmitButton() {
            handleFeedbackClick('Submit');
        }
    }));
    const handleFeedbackClick = async (action) => {
        let count = localSubmitCount;
        if (action === 'Submit') {
            count++;
            setLocalSubmitCount(count);
            const result = await handleSubmit('Submit');
            const isCorrect = result.feedbackData.isCorrect ?? false;
            setIsCorrect(isCorrect);
            //setShowSplash(true);
            if (isCorrect) {
                setAudioURL({ id: "correctSFX", url: result.feedbackData.sfx ? result.feedbackData.sfx : correctSoundEffect, type: "sfx" }, () => {
                    setAudioURL({ id: "correctFeedback", url: result.feedbackData.audio, type: "correctFeedback" });
                });

                // if (result.lastGame) {
                //     setShowSplash(true);
                //     //setSubmitText('المهمة التالية');
                //     setSubmitText(intl.formatMessage({id: 'feedback.next'}));
                //     setSubmitAction('nextGame');
                // }else{
                //     setSubmitText(<svg xmlns="http://www.w3.org/2000/svg" viewBox="-5 -10 64 64" fill="currentColor" ><path d="M27.52,43.54l-2.37,2.38a2.56,2.56,0,0,1-3.62,0L.75,25.15a2.56,2.56,0,0,1,0-3.62L21.53.75a2.56,2.56,0,0,1,3.62,0l2.37,2.38a2.55,2.55,0,0,1,0,3.66L14.6,19.06H45.32a2.55,2.55,0,0,1,2.56,2.57V25a2.55,2.55,0,0,1-2.56,2.57H14.6L27.48,39.88A2.54,2.54,0,0,1,27.52,43.54Z"></path></svg>);
                //     //setSubmitText(<img src={nextIcon} alt="next icon" />);
                //     setSubmitAction('next');
                // }
            }
            else {
                //setAudioURL({id: "wrong",url: incorrectSoundEffect, type: "incorrectSoundEffect"});
                setAudioURL({ id: "wrong", url: result.feedbackData.sfx ? result.feedbackData.sfx : incorrectSoundEffect, type: "sfx" }, () => {
                    setAudioURL({ id: "incorrectFeedback", url: result.feedbackData.audio, type: "incorrectFeedback" });
                });

                // if (result.lastGame) {
                //     setShowSplash(true);
                //     //setSubmitText('المهمة التالية');
                //     setSubmitText(intl.formatMessage({id: 'feedback.next'}));
                //     setSubmitAction('nextGame');
                // }else if (submitLimit && count < submitLimit) {
                //     //setSubmitText('Try Again');
                //     setSubmitText(intl.formatMessage({id: 'feedback.tryagain'}));
                //     setSubmitAction('tryagain');
                // } else {
                //     setSubmitText(<svg xmlns="http://www.w3.org/2000/svg" viewBox="-5 -10 64 64" fill="currentColor" ><path d="M27.52,43.54l-2.37,2.38a2.56,2.56,0,0,1-3.62,0L.75,25.15a2.56,2.56,0,0,1,0-3.62L21.53.75a2.56,2.56,0,0,1,3.62,0l2.37,2.38a2.55,2.55,0,0,1,0,3.66L14.6,19.06H45.32a2.55,2.55,0,0,1,2.56,2.57V25a2.55,2.55,0,0,1-2.56,2.57H14.6L27.48,39.88A2.54,2.54,0,0,1,27.52,43.54Z"></path></svg>);
                //     //setSubmitText(<img src={nextIcon} alt="next icon" />);
                //     setSubmitAction('next');
                // }

            }
            setSubmitText(intl.formatMessage({ id: "feedback.continue" }));
            setSubmitAction('continue');

        } else if (action === 'continue') {
            const swiper = document.querySelector('#container-swiper')?.swiper;
            swiper.slideTo(1, 1);
        }
        // else if (action === 'tryagain') {
        //   setLocalSubmitCount(0);
        //   //setSubmitText('جرّب');
        //   setSubmitText(intl.formatMessage({id: 'feedback.submit'}));
        //   setSubmitAction('Submit');
        //   handleSubmit('tryagain');
        // } else if (action === 'nextGame') {
        //   // swiper.slideNext();

        //   swiper.slideTo(2, 1);

        //   setLocalSubmitCount(0);
        //   //setSubmitText(' المهمة التالية');
        //   setSubmitText(intl.formatMessage({id: 'feedback.next'}));
        //   setSubmitAction('nextGame');
        //   handleSubmit('reset');
        // } else if (action === 'next') {
        //   setLocalSubmitCount(0);
        //   //setSubmitText('جرّب');
        //   setSubmitText(intl.formatMessage({id: 'feedback.submit'}));
        //   setSubmitAction('Submit');
        //   handleSubmit('next');
        // }
    };

    // Always use currentTarget to avoid DOM issues
    const handleClick = (e) => {
        const action = e.currentTarget.getAttribute('data-value');
        handleFeedbackClick(action);
    };

    return (<>


        <div className="feedback-container">
           {feedback.class && feedback.message && (
                // <div className={`${feedback.class} feedback-banner`}>
                <motion.div className={`${feedback.class} feedback-banner`} {...getAnimation("slideUp", 0.6, 0)}>
                    <div className="feedback-text" dangerouslySetInnerHTML={{ __html: feedback.message }} />
                </motion.div>
            )}
            {!showSplash && (
                // <div className="btnContainer">
                <motion.div className="btnContainer" {...getAnimation("expandIn", 0.6, 0)}>
                    <Button
                        disabled={submitButtonState}
                        variant="primary"
                        size="sm"
                        data-value={submitAction}
                        onClick={handleClick}
                    >
                        {submitText}
                    </Button>
                </motion.div>
            )}
        </div>
    </>
    );
});

export default Feedback;

// JavaScript source code
