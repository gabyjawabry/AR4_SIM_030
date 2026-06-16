import React, {useContext } from "react";
import { PageContext } from "./utilities/context";
const GoToTOCButton = ({ showResults }) => {
const { tocState } = useContext(PageContext);
const incorrectCount = Object.values(tocState).filter(
    (item) => item.status === "incorrect"
  ).length;


  const findStatusByIndex = (tocState, targetIndex) => {
    const item = Object.values(tocState).find(
      (el) => el.index === targetIndex
    );
    return item ? item.status : null;
  };

  const goToTOC = () => {
    const swiper = document.querySelector('#container-swiper')?.swiper;
    const status = findStatusByIndex(tocState, 3);
    if (!swiper) return;
    // if (showResults && status) {
    //   swiper.slideTo(7, 1);
    // } else if(incorrectCount==3){
    //   swiper.slideTo(7, 1);
    // }else{
    //   swiper.slideTo(1, 1);

    // }
        swiper.slideTo(1, 1);
  };

  return (
    <button
      aria-label="Go to TOC"
      className="show-TOC-button btn"
      onClick={goToTOC}
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="-5 -10 64 64" fill="currentColor">
        <path d="M27.52,43.54l-2.37,2.38a2.56,2.56,0,0,1-3.62,0L.75,25.15a2.56,2.56,0,0,1,0-3.62L21.53.75a2.56,2.56,0,0,1,3.62,0l2.37,2.38a2.55,2.55,0,0,1,0,3.66L14.6,19.06H45.32a2.55,2.55,0,0,1,2.56,2.57V25a2.55,2.55,0,0,1-2.56,2.57H14.6L27.48,39.88A2.54,2.54,0,0,1,27.52,43.54Z"></path>
      </svg>
    </button>
  );
};

export default GoToTOCButton;