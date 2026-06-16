import React, { useRef, useContext, useEffect, useState } from 'react';
import { IntlProvider } from "react-intl";
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import videojs from 'video.js';
import { PageContext } from './utilities/context';
import { PageData, LabelsData } from './utilities/helper';
import { useEventSender } from './utilities/logging';
import LessonSlide from './lessonSlide';

const LessonPage = () => {
  const audioElement = useRef(null);
  const audioEndedCallbackRef = useRef(null);
  const [tocState, setTocState] = useState([]);
  const [userName, setUserName] = useState("");
  const [avatarSelected, setAvatarSelected] = useState(null);
  const [studentGrade, setStudentGrade] = useState(15);
  const locale = PageData.page.language;
  const sendEvent = useEventSender();
  const simulationStartTime = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // TAB key → force intro focus
      if (e.key === "Tab") {
        const introBtn = document.querySelector('.intro-container button');
        if (introBtn) {
          introBtn.focus();
          e.preventDefault();
        }
      }

      // "P" key → stop audio and videos
      if (e.key.toLowerCase() === "p") {
        stopAudio();
        stopAllVideos();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleCheckAnswer = (payload = {}) => {
    const { index, isCorrect } = payload;

    if (index === undefined) return; // safety guard

    setTocState(prev => ({
      ...prev,
      [index]: {
        status: isCorrect ? "correct" : "incorrect"
      }
    }));
  }; 

  const setAudioURLFromWidget = (audioData, onEndedCallback) => {

    stopAllVideos();

    const audio = audioElement.current;
    audio.id = audioData.id;
    if (!audio) return;

    const isPlaying =
      audio.currentTime > 0 &&
      !audio.paused &&
      !audio.ended &&
      audio.readyState > audio.HAVE_CURRENT_DATA;

    try {
      // Remove old listener
      if (audioEndedCallbackRef.current) {
        audio.removeEventListener("ended", audioEndedCallbackRef.current);
      }

      if (audioData?.url) {
        if (audio.src.includes(audioData.url)) {
          // toggle play/pause
          if(audioData?.type == 'sfx'){
            audio.currentTime = 0;
            audio.play();
          }else{
            audio.paused ? audio.play() : audio.pause();
          }
        } else {
          audio.pause();
          audio.currentTime = 0;

          setTimeout(() => {
            audio.src = audioData.url;
            audio.play().catch(() => {}); // prevent crash on autoplay block
          }, 10);
        }
      } else {
        if (isPlaying) {
          audio.pause();
          audio.currentTime = 0;
        }
      }

      // Add new ended callback
      if (onEndedCallback) {
        audioEndedCallbackRef.current = onEndedCallback;
        audio.addEventListener("ended", onEndedCallback);
      }

    } catch (error) {
      console.log(error);
    }
  };

  const onAudioPlay = (e) => {
    sendEvent('play', { 
      mediaId: e.currentTarget.id, 
      mediaType: 'audio', 
      playing: true, 
      url: e.currentTarget.src
    });
  }

  const onAudioPause = (e) => {
    sendEvent('pause', { 
      mediaId: e.currentTarget.id, 
      mediaType: 'audio', 
      playing: false, 
      url: e.currentTarget.src
    });
  }

  const stopAudio = () => {
    const audio = audioElement.current;
    if (!audio) return;

    const isPlaying =
      audio.currentTime > 0 &&
      !audio.paused &&
      !audio.ended &&
      audio.readyState > audio.HAVE_CURRENT_DATA;

    // remove listener
    if (audioEndedCallbackRef.current) {
      audio.removeEventListener("ended", audioEndedCallbackRef.current);
      audioEndedCallbackRef.current = null;
    }

    if (isPlaying) {
      audio.pause();
      audio.currentTime = 0;
    }
  };

  const stopAllVideos = () => {
    const players = videojs.getAllPlayers();
    players.forEach(player => {
      if (player && !player.paused()) {
        player.pause();
      }
    });
  };

  const setSimulationStartTime = () => {
    simulationStartTime.current = Date.now();
  };

  return (
    <PageContext.Provider
      value={{
        setAudioURL: setAudioURLFromWidget,
        stopAudio: stopAudio,
        stopAllVideos: stopAllVideos,
        userName:userName,
        setUserName: setUserName,
        avatarSelected: avatarSelected,
        setAvatarSelected: setAvatarSelected,
        studentGrade: studentGrade,
        setStudentGrade: setStudentGrade,
        tocState: tocState,
        setTocState: setTocState,
        simulationStartTime: simulationStartTime,
        setSimulationStartTime: setSimulationStartTime
      }}
    >
      <IntlProvider locale={locale} messages={LabelsData[locale]} defaultLocale="ar">
        {PageData.page ? (
          <Container fluid className="h-100 p-0 d-flex flex-column">
            
            <audio ref={audioElement} preload="auto" onPause={onAudioPause} onPlay={onAudioPlay}/>

            <Container fluid className="slider-wrapper px-0">
              <Row className="h-100 w-100 mx-0 position-relative">
                <Col className="p-0 h-100 position-relative">
                  {PageData.page.content?.[0]?.component_id && (
                    <LessonSlide
                    id={PageData.page.content[0].component_id}
                    tocState={tocState}
                      handleCheckAnswer={handleCheckAnswer}
                      
                    />
                  )}
                </Col>
              </Row>
            </Container>

          </Container>
        ) : (
          <Container fluid className="h-100 p-0" />
        )}
      </IntlProvider>
    </PageContext.Provider>
  );
};

export default LessonPage;