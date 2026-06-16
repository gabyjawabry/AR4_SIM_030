import React from "react";
import { motion } from "framer-motion";
import { getAnimation, ShowCorrectStars } from "../../../container/js/utilities/utilities";
import CheckRounded from "../../../container/images/icons/check.svg?react";
import CorrectStars from "../../../container/images/correct-stars.svg?react";

const DroppedItem = ({ item, index, className, remove }) => {
  if (!item) return null;

  return (
    <div
      className="dropped-item"
       onClick={() => remove?.(index)}
      style={{ pointerEvents: "auto" }}
    >
      {item.type === "text" ? (
        <>
          <span>{item.value}</span>
          {
            className.includes('correct') && !className.includes('incorrect') && (
              <>
                <div className='symbolHolder'>
                  <CheckRounded className={`me-3`} /> 
                </div>
                <ShowCorrectStars />
              </>
            )
          }
        </>
      ) : (
        <img
          src={item.value}
          alt=""
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
          }}
        />
      )}
    </div>
  );
};

export default DroppedItem;
