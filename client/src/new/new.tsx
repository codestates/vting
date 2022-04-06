import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { patchGetVote, RootState, setRestart } from "../store/index";
import VoteBody from "./VoteBody";
import VoteFormats from "./VoteFormats";
import axios from "axios";
import "./new.scss";
import {
  transitions,
  positions,
  AlertTemplateProps,
  AlertOptions,
  Provider as AlertProvider,
} from "react-alert";

const options: AlertOptions = {
  position: positions.TOP_CENTER,
  // timeout: 5000,
  offset: "70px",
  transition: transitions.SCALE,
};

const AlertTemplate = ({
  message,
  options,
  close,
  style,
}: AlertTemplateProps) => {
  return (
    <VoteAlert
      close={close}
      message={message}
      options={options}
      style={style}
    />
  );
};

function NewVote() {
  const isLogin = useSelector((state: RootState) => state.isLogin);

  console.log(isLogin);

  return (
    <AlertProvider template={AlertTemplate} {...options}>
      <div className="bodyContainer">
        <div className="bannerCon">
          {isLogin.login ? (
            ""
          ) : (
            <div className="nonUserBanner">
              잠깐! 로그인 하지 않은 상태로 생성한 설문은 1시간 후 사라집니다.
              지금 무료 가입 후 나의 설문을 체계적으로 관리해보세요!
            </div>
          )}
          <div className="newVoteCon">
            <VoteFormats />
            <VoteBody />
          </div>
        </div>
      </div>
    </AlertProvider>
  );
}

function VoteAlert({ message, options, close, style }: AlertTemplateProps) {
  const navigate = useNavigate();
  const newVote = useSelector((state: RootState) => state.makeNewVote);
  const newVoteFormat = newVote.format;
  const [newVotePassword, setNewVotePassword] = useState("");
  const [newVotePasswordRe, setNewVotePasswordRe] = useState("");
  const [isMatch, setIsMatch] = useState(true);
  const dispatch = useDispatch();
  const serverURL = process.env.SERVER_URL;

  useEffect(() => {
    if (newVotePassword === newVotePasswordRe) {
      setIsMatch(true);
    } else {
      setIsMatch(false);
    }
  }, [newVotePassword, newVotePasswordRe]);

  const sendNewVote = async () => {
    const sendBody = logoutVoteBody();

    try {
      const response = await axios.post(serverURL + "/vting", sendBody, {
        headers: {
          withCredentials: true,
        },
      });
      if (response.status === 201) {
        dispatch(setRestart("delete all!!"));
        dispatch(
          patchGetVote({
            title: response.data.data.title,
            items: response.data.data.items || response.data.data.response,
            sumCount: response.data.sumCount || 0,
          })
        );
        navigate(`/v/${response.data.data.url}`);
        close();
      }
    } catch (e) {
      console.log(e);
    }
  };

  const logoutVoteBody = () => {
    let sendVoteBody = {};

    switch (newVoteFormat) {
      case "bar":
        sendVoteBody = {
          title: newVote.title,
          format: newVote.format,
          type: newVote.type,
          items: newVote.items,
          manytimes: newVote.manytimes,
          multiple: newVote.multiple,
          password: newVotePassword,
        };
        return sendVoteBody;
      case "open":
        sendVoteBody = {
          title: newVote.title,
          format: newVote.format,
          manytimes: newVote.manytimes,
          password: newVotePassword,
        };
        return sendVoteBody;
      case "versus":
        sendVoteBody = {
          title: newVote.title,
          format: newVote.format,
          items: newVote.items,
          manytimes: newVote.manytimes,
          multiple: newVote.multiple,
          password: newVotePassword,
        };
        return sendVoteBody;
      case "word":
        sendVoteBody = {
          title: newVote.title,
          format: newVote.format,
          manytimes: newVote.manytimes,
          password: newVotePassword,
        };
        return sendVoteBody;
      default:
        console.log("오류 발생 : 투표 포맷이 선택되지 않음");
        return;
    }
  };

  return (
    <div className="makeVoteAlert" style={style}>
      <div className="alertTitle">
        &#128565; 비회원 설문 생성 알림 &#128565;
      </div>
      <div className="alertContent">
        <div className="alertContentText">
          현재 비회원 상태로 설문을 생성하고 있습니다.
          <br />
          생성한 설문이 1시간 후 자동으로 종료 및 삭제됩니다.
          <br />
          회원 가입 후 영구 보관할 수 있는 설문을 무제한 무료로 만들어보세요.
        </div>
      </div>
      <div className="alertInput">
        <div className="alertContentText">
          비회원 설문 생성으로 계속하시려면
          <br />
          생성 후 설문을 관리하기 위한 임시 비밀번호를 입력해주세요.
        </div>
        <div className="alertInputPassword">
          <label htmlFor="password" className="passwordLabel">
            임시 비밀번호
          </label>
          <input
            type="password"
            name="password"
            value={newVotePassword || ""}
            onChange={(e) => setNewVotePassword(e.target.value)}
          ></input>
        </div>
        <div className="alertInputPassword">
          <label htmlFor="passwordre" className="passwordLabel">
            비밀번호 확인
          </label>
          <input
            type="password"
            name="passwordre"
            value={newVotePasswordRe || ""}
            onChange={(e) => {
              setNewVotePasswordRe(e.target.value);
            }}
          ></input>
          <div className={isMatch ? "notMatched none" : "notMatched"}>
            ! 비밀번호가 일치하지 않습니다.
          </div>
        </div>
      </div>
      <button className="vtingButton" onClick={close}>
        생성 화면으로 돌아가기
      </button>
      <button
        className={isMatch ? "vtingButton" : "vtingButtonGray"}
        onClick={() => sendNewVote()}
      >
        설문 생성 완료
      </button>
    </div>
  );
}

export default NewVote;
