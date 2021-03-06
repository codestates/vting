import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  setTitle,
  setItems,
  setMultiple,
  setManyTimes,
  deleteItems,
  RootState,
} from "../store/index";
import vtinglogo from "../assets/vt_logo_2.png";
import VoteButton from "./VoteButton";
import option_alt_image_1 from "../assets/option_alts/option_alt_img_1.svg";
import option_alt_image_2 from "../assets/option_alts/option_alt_img_2.svg";
import AOS from "aos";
AOS.init();

function VoteMaker() {
  const newVoteFormat = useSelector(
    (state: RootState) => state.makeNewVote.format
  );

  switch (newVoteFormat) {
    case "bar":
      return <Bar />;
    case "open":
      return <OpenEnded />;
    case "versus":
      return <Versus />;
    case "word":
      return <WordCloud />;
    default:
      return (
        <div className="voteMakerCon" data-aos="flip-left">
          <img src={vtinglogo} className="vting-logo" alt="vting-logo" />
        </div>
      );
  }
}

// ๋ฐ ๊ทธ๋ํ
function Bar() {
  const dispatch = useDispatch();
  const newVote = useSelector((state: RootState) => state.makeNewVote);
  const newVoteMt = newVote.manytimes;
  const newVoteMp = newVote.multiple;
  const newVoteItems = newVote.items;
  const [isShake, setIsShake] = useState(false);
  const [typedItem, setTypedItem] = useState(
    newVoteItems[newVoteItems.length]
      ? newVoteItems[newVoteItems.length].content
      : ""
  );
  const [titleShake, setTitleShake] = useState(false);
  const [everytingIsOk, setEverythingIsOk] = useState(false);
  const [itemShake, setItemShake] = useState(false);
  const [option1, setOption1] = useState(false);
  const [option2, setOption2] = useState(false);

  useEffect(() => {
    if (newVote.title) setTitleShake(false);
    if (newVote.items.length > 1) setItemShake(false);
    if (newVote.title && newVote.items.length > 1) setEverythingIsOk(true);
  }, [newVote.title, newVote.items]);

  const plusTriger = () => {
    if (typedItem) {
      dispatch(setItems({ idx: newVoteItems.length, content: typedItem }));
      setTypedItem("");
    } else {
      setIsShake(true);
      setTimeout(function () {
        setIsShake(false);
      }, 1000);
    }
  };

  const minusTriger = (num: number) => {
    dispatch(deleteItems(num));
  };

  return (
    <div className="voteMakerCon" data-aos="flip-left">
      <label
        className={titleShake ? "voteLabel shakeIt" : "voteLabel"}
        htmlFor="voteTitle"
      >
        &#128073; STEP1. ์ค๋ฌธ ์?๋ชฉ์ ์๋?ฅํ์ธ์.
      </label>
      <input
        className="VotetextInput"
        name="voteTitle"
        value={newVote.title}
        onChange={(e) => dispatch(setTitle(e.target.value))}
      ></input>
      <div className={titleShake ? "voteTitleErr voteTitle" : "voteTitle"}>
        ! ์ค๋ฌธ ์?๋ชฉ์ ํ์ ํญ๋ชฉ์๋๋ค.
      </div>

      <div
        className={
          titleShake ? "voteLabel topMargin10 shakeIt" : "voteLabel topMargin10"
        }
      >
        &#128073; STEP2. ์?ํ์ง๋ฅผ ๋ง๋ค์ด๋ณด์ธ์.
      </div>
      <div className="voteAnswers">
        {newVoteItems?.map((el, idx) => (
          <div key={idx} className="voteAnswer">
            <div className="answerIdx">{el.idx + 1}</div>
            <input
              className="VoteAnswerInput"
              value={el.content}
              onChange={(e) =>
                dispatch(setItems({ idx: el.idx, content: e.target.value }))
              }
            ></input>
            <div className="plusItem" onClick={() => minusTriger(el.idx)}>
              -
            </div>
          </div>
        ))}
        <div className={isShake ? "voteAnswer shakeIt" : "voteAnswer"}>
          <div className="answerIdx">{newVoteItems.length + 1}</div>
          <input
            className="VoteAnswerInput"
            value={typedItem}
            placeholder="์ด๊ณณ์ ํญ๋ชฉ์ ์๋?ฅํ๊ณ? + ๋ฒํผ์ผ๋ก ์ถ๊ฐํ์ธ์."
            onBlur={() => plusTriger()}
            onChange={(e) => {
              setTypedItem(e.target.value);
            }}
            onKeyPress={(e) => {
              if (e.key === "Enter") plusTriger();
            }}
          ></input>
          <div className="plusItem" onClick={() => plusTriger()}>
            +
          </div>
        </div>
      </div>
      <div className={itemShake ? "voteItemErr voteItem" : "voteItem"}>
        ! ์ต์ ๋ ๊ฐ ์ด์์ ์๋ต ํญ๋ชฉ์ด ํ์ํฉ๋๋ค.
      </div>

      <div className="voteLabel topMargin10">
        &#128073; STEP3. ์ค๋ฌธ ์ต์์ ์?ํํ์ธ์.
      </div>

      <div className="voteOptionItems">
        <div className="voteOptionItem">
          <div
            className="fakeCheck"
            onClick={() => {
              dispatch(setMultiple(!newVoteMp));
            }}
          >
            <svg
              viewBox="0 0 24 24"
              visibility={newVoteMp ? "visible" : "hidden"}
            >
              <polyline points="19 7 10 17 5 12" />
            </svg>
          </div>
          <label htmlFor="voteMultiple">๋ค์ค์?ํ ๊ฐ๋ฅ</label>
          <div className="option" onClick={() => setOption1(!option1)}>
            ?
          </div>
        </div>
        <div className={option1 ? "optionAlt block" : "optionAlt"}>
          <img src={option_alt_image_1} alt="option_Alt" />
          ์ฌ๋ฌ ๊ฐ์ ์?ํ์ง๋ฅผ ํ๊บผ๋ฒ์ ๊ณ?๋ฅผ ์ ์๋ ์ค๋ฌธ์ผ๋ก ๋ง๋์๋?ค๋ฉด ์ด ์ต์์
          ์ฒดํฌํ์ธ์.
          <br />
          ์ฒดํฌํ์ง ์์ ๊ฒฝ์ฐ ํ๊ฐ์ง ์?ํ์ง๋ง ์?ํ ๊ฐ๋ฅํ ์ค๋ฌธ์ผ๋ก ๋ง๋ค์ด์ง๋๋ค.
        </div>
        <div className="voteOptionItem">
          <div
            className="fakeCheck"
            onClick={() => {
              dispatch(setManyTimes(!newVoteMt));
            }}
          >
            <svg
              viewBox="0 0 24 24"
              visibility={newVoteMt ? "visible" : "hidden"}
            >
              <polyline points="19 7 10 17 5 12" />
            </svg>
          </div>
          <label htmlFor="voteManytimes">์ฌ๋ฌ๋ฒ ์๋ต ๊ฐ๋ฅ</label>
          <div className="option" onClick={() => setOption2(!option2)}>
            ?
          </div>
        </div>
        <div className={option2 ? "optionAlt block" : "optionAlt"}>
          <img src={option_alt_image_2} alt="option_Alt" />
          ํ ์ฌ๋์ด ์ฌ๋ฌ ๋ฒ ์๋ตํ? ์ ์๋ ์ค๋ฌธ์ผ๋ก ๋ง๋์๋?ค๋ฉด ์ด ์ต์์
          ์ฒดํฌํ์ธ์.
          <br />
          ์ฒดํฌํ์ง ์์ ๊ฒฝ์ฐ ํ ๊ธฐ๊ธฐ์์ ํ ๋ฒ๋ง ์๋ต์ด ๊ฐ๋ฅํ ์ค๋ฌธ์ผ๋ก
          ๋ง๋ค์ด์ง๋๋ค.
        </div>
      </div>
      <VoteButton
        everytingIsOk={everytingIsOk}
        setTitleShake={setTitleShake}
        setItemShake={setItemShake}
      />
    </div>
  );
}

function OpenEnded() {
  const newVote = useSelector((state: RootState) => state.makeNewVote);
  const newVoteTitle = newVote.title;
  const newVoteMt = newVote.manytimes;
  const dispatch = useDispatch();
  const [option2, setOption2] = useState(false);

  const [titleShake, setTitleShake] = useState(false);
  const [everytingIsOk, setEverythingIsOk] = useState(false);

  useEffect(() => {
    if (newVote.title) {
      setTitleShake(false);
      setEverythingIsOk(true);
    } else {
      setEverythingIsOk(false);
    }
  }, [newVote.title]);

  return (
    <div className="voteMakerCon" data-aos="flip-left">
      <label
        className={titleShake ? "voteLabel shakeIt" : "voteLabel"}
        htmlFor="voteTitle"
      >
        &#128073; STEP1. ์ค๋ฌธ ์?๋ชฉ์ ์๋?ฅํ์ธ์.
      </label>
      <input
        className="VotetextInput"
        name="voteTitle"
        value={newVoteTitle}
        onChange={(e) => dispatch(setTitle(e.target.value))}
      ></input>
      <div className={titleShake ? "voteTitleErr voteTitle" : "voteTitle"}>
        ! ์ค๋ฌธ ์?๋ชฉ์ ํ์ ํญ๋ชฉ์๋๋ค.
      </div>

      <div className="voteLabel topMargin10">
        &#128073; STEP2. ์ค๋ฌธ ์ต์์ ์?ํํ์ธ์.
      </div>

      <div className="voteOptionItems">
        <div className="voteOptionItem">
          <div className="fakeCheck disabled"></div>
          <label htmlFor="voteMultiple" className="disabledText">
            ๋ค์ค์?ํ ๊ฐ๋ฅ
          </label>
        </div>
        <div className="voteOptionItem">
          <div
            className="fakeCheck"
            onClick={() => {
              dispatch(setManyTimes(!newVoteMt));
            }}
          >
            <svg
              viewBox="0 0 24 24"
              visibility={newVoteMt ? "visible" : "hidden"}
            >
              <polyline points="19 7 10 17 5 12" />
            </svg>
          </div>
          <label htmlFor="voteManytimes">์ฌ๋ฌ๋ฒ ์๋ต ๊ฐ๋ฅ</label>
          <div className="option" onClick={() => setOption2(!option2)}>
            ?
          </div>
        </div>
        <div className={option2 ? "optionAlt block" : "optionAlt"}>
          <img src={option_alt_image_2} alt="option_Alt" />
          ํ ์ฌ๋์ด ์ฌ๋ฌ ๋ฒ ์๋ตํ? ์ ์๋ ์ค๋ฌธ์ผ๋ก ๋ง๋์๋?ค๋ฉด ์ด ์ต์์
          ์ฒดํฌํ์ธ์.
          <br />
          ์ฒดํฌํ์ง ์์ ๊ฒฝ์ฐ ํ ๊ธฐ๊ธฐ์์ ํ ๋ฒ๋ง ์๋ต์ด ๊ฐ๋ฅํ ์ค๋ฌธ์ผ๋ก
          ๋ง๋ค์ด์ง๋๋ค.
        </div>
      </div>
      <VoteButton everytingIsOk={everytingIsOk} setTitleShake={setTitleShake} />
    </div>
  );
}

function Versus() {
  const newVote = useSelector((state: RootState) => state.makeNewVote);
  const newVoteTitle = newVote.title;
  const newVoteMt = newVote.manytimes;
  const newVoteMp = newVote.multiple;
  const newVoteItems = newVote.items;
  const dispatch = useDispatch();
  const [option1, setOption1] = useState(false);
  const [option2, setOption2] = useState(false);

  const [titleShake, setTitleShake] = useState(false);
  const [everytingIsOk, setEverythingIsOk] = useState(false);
  const [itemShake, setItemShake] = useState(false);

  useEffect(() => {
    if (newVote.title) setTitleShake(false);
    if (newVote.items.length > 1) setItemShake(false);
    if (newVote.title && newVote.items.length > 1) setEverythingIsOk(true);
  }, [newVote.title, newVote.items]);

  return (
    <div className="voteMakerCon" data-aos="flip-left">
      <label
        className={titleShake ? "voteLabel shakeIt" : "voteLabel"}
        htmlFor="voteTitle"
      >
        &#128073; STEP1. ์ค๋ฌธ ์?๋ชฉ์ ์๋?ฅํ์ธ์.
      </label>
      <input
        className="VotetextInput"
        name="voteTitle"
        value={newVoteTitle}
        onChange={(e) => dispatch(setTitle(e.target.value))}
      ></input>
      <div className={titleShake ? "voteTitleErr voteTitle" : "voteTitle"}>
        ! ์ค๋ฌธ ์?๋ชฉ์ ํ์ ํญ๋ชฉ์๋๋ค.
      </div>

      <div className="voteLabel topMargin10">
        &#128073; STEP2. ๋๊ฒฐ ํญ๋ชฉ์ ์๋?ฅํ์ธ์.
      </div>
      <div className="voteAnswers versusAnswers">
        <div className="voteAnswer versusAnswer">
          <input
            className="VoteAnswerInput versusAnswerInput"
            value={newVoteItems[0] ? newVoteItems[0].content : ""}
            onChange={(e) => {
              dispatch(setItems({ idx: 0, content: e.target.value }));
            }}
          ></input>
        </div>
        <div>vs</div>
        <div className="voteAnswer versusAnswer">
          <input
            className="VoteAnswerInput versusAnswerInput"
            value={newVoteItems[1] ? newVoteItems[1].content : ""}
            onChange={(e) => {
              dispatch(setItems({ idx: 1, content: e.target.value }));
            }}
          ></input>
        </div>
      </div>
      <div className={itemShake ? "voteItemErr voteItem" : "voteItem"}>
        ! ๋ ๊ฐ์ ๋๊ฒฐํญ๋ชฉ์ด ๋ชจ๋ ํ์ํฉ๋๋ค.
      </div>

      <div className="voteLabel topMargin10">
        &#128073; STEP3. ์ค๋ฌธ ์ต์์ ์?ํํ์ธ์.
      </div>

      <div className="voteOptionItems">
        <div className="voteOptionItem">
          <div
            className="fakeCheck"
            onClick={() => {
              dispatch(setMultiple(!newVoteMp));
            }}
          >
            <svg
              viewBox="0 0 24 24"
              visibility={newVoteMp ? "visible" : "hidden"}
            >
              <polyline points="19 7 10 17 5 12" />
            </svg>
          </div>
          <label htmlFor="voteMultiple">๋ค์ค์?ํ ๊ฐ๋ฅ</label>
          <div className="option" onClick={() => setOption1(!option1)}>
            ?
          </div>
        </div>
        <div className={option1 ? "optionAlt block" : "optionAlt"}>
          <img src={option_alt_image_1} alt="option_Alt" />
          ์ฌ๋ฌ ๊ฐ์ ์?ํ์ง๋ฅผ ํ๊บผ๋ฒ์ ๊ณ?๋ฅผ ์ ์๋ ์ค๋ฌธ์ผ๋ก ๋ง๋์๋?ค๋ฉด ์ด ์ต์์
          ์ฒดํฌํ์ธ์.
          <br />
          ์ฒดํฌํ์ง ์์ ๊ฒฝ์ฐ ํ๊ฐ์ง ์?ํ์ง๋ง ์?ํ ๊ฐ๋ฅํ ์ค๋ฌธ์ผ๋ก ๋ง๋ค์ด์ง๋๋ค.
        </div>
        <div className="voteOptionItem">
          <div
            className="fakeCheck"
            onClick={() => {
              dispatch(setManyTimes(!newVoteMt));
            }}
          >
            <svg
              viewBox="0 0 24 24"
              visibility={newVoteMt ? "visible" : "hidden"}
            >
              <polyline points="19 7 10 17 5 12" />
            </svg>
          </div>
          <label htmlFor="voteManytimes">์ฌ๋ฌ๋ฒ ์๋ต ๊ฐ๋ฅ</label>
          <div className="option" onClick={() => setOption2(!option2)}>
            ?
          </div>
        </div>
        <div className={option2 ? "optionAlt block" : "optionAlt"}>
          <img src={option_alt_image_2} alt="option_Alt" />
          ํ ์ฌ๋์ด ์ฌ๋ฌ ๋ฒ ์๋ตํ? ์ ์๋ ์ค๋ฌธ์ผ๋ก ๋ง๋์๋?ค๋ฉด ์ด ์ต์์
          ์ฒดํฌํ์ธ์.
          <br />
          ์ฒดํฌํ์ง ์์ ๊ฒฝ์ฐ ํ ๊ธฐ๊ธฐ์์ ํ ๋ฒ๋ง ์๋ต์ด ๊ฐ๋ฅํ ์ค๋ฌธ์ผ๋ก
          ๋ง๋ค์ด์ง๋๋ค.
        </div>
      </div>
      <VoteButton
        everytingIsOk={everytingIsOk}
        setTitleShake={setTitleShake}
        setItemShake={setItemShake}
      />
    </div>
  );
}

function WordCloud() {
  const newVote = useSelector((state: RootState) => state.makeNewVote);
  const newVoteTitle = newVote.title;
  const newVoteMt = newVote.manytimes;
  const dispatch = useDispatch();
  const [option2, setOption2] = useState(false);

  const [titleShake, setTitleShake] = useState(false);
  const [everytingIsOk, setEverythingIsOk] = useState(false);

  useEffect(() => {
    if (newVote.title) {
      setTitleShake(false);
      setEverythingIsOk(true);
    } else {
      setEverythingIsOk(false);
    }
  }, [newVote.title]);

  return (
    <div className="voteMakerCon" data-aos="flip-left">
      <label
        className={titleShake ? "voteLabel shakeIt" : "voteLabel"}
        htmlFor="voteTitle"
      >
        &#128073; STEP1. ์ค๋ฌธ ์?๋ชฉ์ ์๋?ฅํ์ธ์.
      </label>
      <input
        className="VotetextInput"
        name="voteTitle"
        value={newVoteTitle}
        onChange={(e) => dispatch(setTitle(e.target.value))}
      ></input>
      <div className={titleShake ? "voteTitleErr voteTitle" : "voteTitle"}>
        ! ์ค๋ฌธ ์?๋ชฉ์ ํ์ ํญ๋ชฉ์๋๋ค.
      </div>

      <div className="voteLabel topMargin10">
        &#128073; STEP2. ์ค๋ฌธ ์ต์์ ์?ํํ์ธ์.
      </div>

      <div className="voteOptionItems">
        <div className="voteOptionItem">
          <div className="fakeCheck disabled"></div>
          <label htmlFor="voteMultiple" className="disabledText">
            ๋ค์ค์?ํ ๊ฐ๋ฅ
          </label>
        </div>
        <div className="voteOptionItem">
          <div
            className="fakeCheck"
            onClick={() => {
              dispatch(setManyTimes(!newVoteMt));
            }}
          >
            <svg
              viewBox="0 0 24 24"
              visibility={newVoteMt ? "visible" : "hidden"}
            >
              <polyline points="19 7 10 17 5 12" />
            </svg>
          </div>
          <label htmlFor="voteManytimes">์ฌ๋ฌ๋ฒ ์๋ต ๊ฐ๋ฅ</label>
          <div className="option" onClick={() => setOption2(!option2)}>
            ?
          </div>
        </div>
        <div className={option2 ? "optionAlt block" : "optionAlt"}>
          <img src={option_alt_image_2} alt="option_Alt" />
          ํ ์ฌ๋์ด ์ฌ๋ฌ ๋ฒ ์๋ตํ? ์ ์๋ ์ค๋ฌธ์ผ๋ก ๋ง๋์๋?ค๋ฉด ์ด ์ต์์
          ์ฒดํฌํ์ธ์.
          <br />
          ์ฒดํฌํ์ง ์์ ๊ฒฝ์ฐ ํ ๊ธฐ๊ธฐ์์ ํ ๋ฒ๋ง ์๋ต์ด ๊ฐ๋ฅํ ์ค๋ฌธ์ผ๋ก
          ๋ง๋ค์ด์ง๋๋ค.
        </div>
      </div>
      <VoteButton everytingIsOk={everytingIsOk} setTitleShake={setTitleShake} />
    </div>
  );
}

export default VoteMaker;
