import React, { useEffect, useState, useRef, CSSProperties } from "react";
import "./v.scss";
import ReactWordcloud, { MinMaxPair } from "react-wordcloud";
import "tippy.js/dist/tippy.css";
import "tippy.js/animations/scale.css";
import axios from "axios";
import { useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { patchGetVote, RootState } from "../store/index";

type IntervalFunction = () => unknown | void;

function useInterval(callback: IntervalFunction, delay: number) {
  const savedCallback = useRef<IntervalFunction | null>(null);

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  });

  // Set up the interval.
  useEffect(() => {
    function tick() {
      if (savedCallback.current !== null) {
        savedCallback.current();
      }
    }
    const id = setInterval(tick, delay);
    return () => clearInterval(id);
  }, [delay]);
}

// 랜덤길이(너비) 생성 관련
const makeRandomHeight = (num: number, sum: number): React.CSSProperties => {
  let heightProprety = { height: (num / sum) * 100 + "%" };
  return heightProprety;
};
const makeRandomWidth = (num: number, sum: number): React.CSSProperties => {
  let heightProprety = { width: (num / sum) * 100 + "%" };
  return heightProprety;
};

// 컴포넌트 시작
function Vresult() {
  const { code } = useParams();
  const voteData = useSelector((state: RootState) => state.getVote);
  const items = voteData.items;
  const sum = voteData.sumCount || 0;
  const format = voteData.format;
  const type = voteData.type;
  const dispatch = useDispatch();
  const serverURL = process.env.SERVER_URL;
  const [words, setWords] = useState([{ text: "", value: 10 }]);

  // 워드클라우드 세팅
  useEffect(() => {
    let newWords;
    if (items.length) {
      newWords = items.map((el: any) => ({
        text: el.content ? (el.content as string) : "",
        value: el.count ? (el.count as number) : 1,
      }));
    } else {
      newWords = [{ text: "", value: 0 }];
    }
    setWords(newWords);
  }, [items]);

  const fontSizes = [20, 50] as MinMaxPair;
  const rotationAngles = [0, 90] as [number, number];
  const options = {
    fontSizes: fontSizes,
    rotationAngles: rotationAngles,
    rotations: 2,
  };

  // 처음 접속하면 응답 새로 받아오기
  useEffect(() => {
    async function getAnswers() {
      try {
        const response = await axios.get(`${serverURL}/voter/${code}`);
        if (response.status === 200) {
          dispatch(
            patchGetVote({
              title: response.data.vote_data.title,
              items:
                response.data.vote_data.items ||
                response.data.vote_data.response,
              sumCount: response.data.sumCount || 0,
              format: response.data.vote_data.format,
              type: response.data.vote_data.type || "",
            })
          );
        }
      } catch (e) {
        console.log(e);
      }
    }
    getAnswers();
  }, []);

  // 5초에 한 번씩 ajax 요청 (응답 덮어쓰기)
  useInterval(async () => {
    const response = await axios.get(`${serverURL}/voter/${code}`);
    if (response.status === 200) {
      if (
        response.data.vote_data.format === "word" &&
        response.data.sumCount === voteData.sumCount
      ) {
        // do nothing
      } else {
        dispatch(
          patchGetVote({
            title: response.data.vote_data.title,
            items:
              response.data.vote_data.items || response.data.vote_data.response,
            sumCount: response.data.sumCount || 0,
          })
        );
      }
    }
  }, 5000);

  // versus 폰트 크기 조절 관련
  let fontSizeChange1: CSSProperties;
  let fontSizeChange2: CSSProperties;
  if (items.length) {
    fontSizeChange1 = {
      fontSize:
        items[0] && items[0].count
          ? ((items[0].count as number) / sum) * 100
          : 30,
    };
    fontSizeChange2 = {
      fontSize:
        items[1] && items[1].count
          ? ((items[1].count as number) / sum) * 100
          : 30,
    };
  } else {
    fontSizeChange1 = {
      fontSize: 30,
    };
    fontSizeChange2 = {
      fontSize: 30,
    };
  }

  switch (format) {
    case "bar":
      if (type === "vertical") {
        return (
          <div className="realTimeCon">
            <div className="votePreviewBack vResult">
              <div className="votePreview-barVer-con">
                {items ? (
                  items.map((el, idx) => (
                    <div key={idx} id="votePreview-barVer-bar">
                      <div className="barVer-itemNameCon">
                        <div className="barVer-itemName">{el.content}</div>
                        <div className="triangle"></div>
                      </div>
                      <div
                        className="barVer-itemBar"
                        style={makeRandomHeight(
                          el.count as number,
                          sum as number
                        )}
                      ></div>
                    </div>
                  ))
                ) : (
                  <div>설문 정보를 불러올 수 없습니다.</div>
                )}
              </div>
            </div>
          </div>
        );
      } else if (type === "horizontal") {
        return (
          <div className="realTimeCon">
            <div className="votePreviewBack">
              <div className="votePreview-barHor-con">
                {items ? (
                  items.map((el, idx) => (
                    <div key={idx} id="votePreview-barHor-bar">
                      <div className="barHor-itemNameCon">
                        <div className="barHor-itemName">{el.content}</div>
                        <div className="triangle"></div>
                      </div>
                      <div
                        className="barHor-itemBar"
                        style={makeRandomWidth(
                          el.count as number,
                          sum as number
                        )}
                      ></div>
                    </div>
                  ))
                ) : (
                  <div>설문 정보를 불러올 수 없습니다.</div>
                )}
              </div>
            </div>
          </div>
        );
      }
      return <></>;
    case "open":
      return (
        <div className="realTimeCon">
          <div className="openEndCon">
            {items ? (
              items.map((el, idx) => (
                <div
                  className={
                    idx < 4
                      ? `openendIcon border${idx + 1}`
                      : `openendIcon border${idx - 3}`
                  }
                  key={idx}
                >
                  {el.content}
                </div>
              ))
            ) : (
              <div>설문 정보를 불러올 수 없습니다.</div>
            )}
          </div>
        </div>
      );
    case "versus":
      return (
        <div className="realTimeCon">
          <div className="versusCon">
            <div className="item1" style={fontSizeChange1}>
              {items.length ? items[0].content : ""}
            </div>
            <div className="vs">vs</div>
            <div className="item2" style={fontSizeChange2}>
              {items.length ? items[1].content : ""}
            </div>
          </div>
        </div>
      );
    case "word":
      return <ReactWordcloud words={words} options={options} />;
    default:
      return <div>데이터 불러오기 실패</div>;
  }
}

export default Vresult;
