import axios from "axios";
import React, { useState, Dispatch, SetStateAction, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { patchGetVote, RootState } from "../store/index";

interface Props {
  answerMode?: boolean;
  setAnswerMode: Dispatch<SetStateAction<boolean>>;
  voteData: any;
}

interface Options {
  multiple?: boolean;
  setAnswerMode: Dispatch<SetStateAction<boolean>>;
}

const serverURL = process.env.SERVER_URL;

function VoterAnswer({ setAnswerMode }: Props) {
  const voteData = useSelector((state: RootState) => state.getVote);
  const format = voteData.format;
  const multiple = voteData.multiple;

  switch (format) {
    case "bar":
    case "versus":
      return <Bar multiple={multiple} setAnswerMode={setAnswerMode} />;
    case "open":
    case "word":
      return <Open setAnswerMode={setAnswerMode} />;
    default:
      return <>Ooooops!</>;
  }
}

interface Item {
  idx: number;
  content: string;
  clicked?: boolean;
}

function Bar({ multiple, setAnswerMode }: Options) {
  const voteData = useSelector((state: RootState) => state.getVote);
  const { code } = useParams();
  const [clicked, setClicked] = useState(-1);
  const [multipleMode, setMultipleMode] = useState(multiple);
  const [error, setError] = useState(false);
  const [isEverythingOk, setIsEverythingOk] = useState(false);
  const [multiClicked, setMultiClicked] = useState(
    voteData.items.map((el: Item) => ({
      idx: el.idx,
      content: el.content,
      clicked: false,
    }))
  );

  useEffect(() => {
    setMultipleMode(voteData.multiple);
  }, []);

  useEffect(() => {
    if (multipleMode && countAnswers()) {
      setIsEverythingOk(true);
    } else if (!multipleMode && clicked >= 0) {
      setIsEverythingOk(true);
    }
  }, [clicked, multiClicked]);

  function countAnswers() {
    let result = 0;
    for (let item of multiClicked) {
      if (item.clicked) result++;
    }
    return result;
  }

  async function toResult() {
    if (multipleMode && !countAnswers()) {
      setError(true);
      setTimeout(function () {
        setError(false);
      }, 1000);
    } else if (!multipleMode && clicked < 0) {
      setError(true);
      setTimeout(function () {
        setError(false);
      }, 1000);
    } else {
      const reqBodyIdx = [];
      if (multipleMode) {
        for (let vote of multiClicked) {
          if (vote.clicked) reqBodyIdx.push(vote.idx);
        }
      } else {
        reqBodyIdx.push(clicked);
      }

      try {
        const response = await axios.patch(`${serverURL}/voter/${code}`, {
          idx: reqBodyIdx,
        });
        if (response.status === 200) {
          setAnswerMode(false);
        }
      } catch (e) {
        console.log(e);
      }
    }
  }

  function handleMClicked(idx: number) {
    let newMclicked = [
      ...multiClicked.slice(0, idx),
      {
        idx: idx,
        content: multiClicked[idx].content,
        clicked: !multiClicked[idx].clicked,
      },
      ...multiClicked.slice(idx + 1),
    ];
    setMultiClicked(newMclicked);
  }

  return (
    <div className="votingBody">
      <div className="votingContent">
        <div className="voteAnswers">
          {multipleMode
            ? multiClicked.map((el: Item, idx: number) => (
                <div
                  className="voteAnswer"
                  onClick={() => handleMClicked(el.idx)}
                  key={idx}
                >
                  <div
                    className={
                      multiClicked[idx].clicked
                        ? "answerIdx clickedIdx"
                        : "answerIdx"
                    }
                  >
                    {el.idx + 1}
                  </div>
                  <div
                    className={
                      multiClicked[idx].clicked
                        ? "VoteAnswerContent clickedCtn"
                        : "VoteAnswerContent"
                    }
                  >
                    {el.content}
                  </div>
                </div>
              ))
            : voteData.items.map((el: Item, idx: number) => (
                <div
                  className="voteAnswer"
                  onClick={() => setClicked(el.idx)}
                  key={idx}
                >
                  <div
                    className={
                      el.idx === clicked ? "answerIdx clickedIdx" : "answerIdx"
                    }
                  >
                    {el.idx + 1}
                  </div>
                  <div
                    className={
                      el.idx === clicked
                        ? "VoteAnswerContent clickedCtn"
                        : "VoteAnswerContent"
                    }
                  >
                    {el.content}
                  </div>
                </div>
              ))}
        </div>
        <div className={error ? "errorAlert displayBlock" : "errorAlert"}>
          ! 최소 한 개 이상의 선택지를 선택하셔야 합니다.
        </div>
      </div>
      <div
        className={
          isEverythingOk
            ? "voteCodeButton vtingButton blueButton"
            : "voteCodeButton vtingButton grayButton"
        }
        onClick={() => toResult()}
      >
        응답 결정
      </div>
    </div>
  );
}

function Open({ setAnswerMode }: Options) {
  const { code } = useParams();
  const [subAnswer, setSubAnswer] = useState("");
  const [shake, setShake] = useState(false);
  async function toResult() {
    if (!subAnswer.length) {
      setShake(true);
      setTimeout(function () {
        setShake(false);
      }, 1000);
    } else {
      try {
        const response = await axios.patch(`${serverURL}/voter/${code}`, {
          content: subAnswer,
        });
        if (response.status === 200) {
          setAnswerMode(false);
        }
      } catch (e) {
        console.log(e);
      }
    }
  }

  return (
    <div className="votingBody">
      <div className="votingContent" id="subjectiveContent">
        <label htmlFor="answerInput">당신의 답변은?</label>
        <input
          type="text-area"
          id="answerInput"
          className={shake ? "subjectiveInput shakeInput" : "subjectiveInput"}
          value={subAnswer}
          onChange={(e) => setSubAnswer(e.target.value)}
          placeholder={shake ? "필수 항목입니다." : ""}
        />
      </div>
      <div
        className={
          subAnswer.length
            ? "voteCodeButton vtingButton blueButton"
            : "voteCodeButton vtingButton grayButton"
        }
        onClick={() => toResult()}
      >
        응답 결정
      </div>
    </div>
  );
}

export default VoterAnswer;
