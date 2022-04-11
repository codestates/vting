import React, { Dispatch, SetStateAction } from "react";
import { useNavigate } from "react-router-dom";
import { useAlert } from "react-alert";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { patchGetVote, RootState, setRestart } from "../store/index";

interface Props {
  everytingIsOk: boolean;
  setTitleShake: Dispatch<SetStateAction<boolean>>;
  setItemShake?: Dispatch<SetStateAction<boolean>>;
}

function VoteButton({ everytingIsOk, setTitleShake, setItemShake }: Props) {
  const isAlertOpen = useSelector((state: RootState) => state.voteAlert.isOn);
  const navigate = useNavigate();
  const userInfo = useSelector((state: RootState) => state.userInfo);
  const isLogin = useSelector((state: RootState) => state.isLogin);
  const newVote = useSelector((state: RootState) => state.makeNewVote);
  const newVoteFormat = newVote.format;
  const alert = useAlert();
  const dispatch = useDispatch();

  const serverURL = process.env.REACT_APP_SERVER_URL;

  const sendNewVote = async () => {
    if (!everytingIsOk) {
      if (!newVote.title) setTitleShake(true);
      if (setItemShake && newVote.items.length < 2) setItemShake(true);
    } else {
      if (isLogin.login) {
        const sendBody = loginVoteBody();
        const accessToken = localStorage.getItem("accessToken");

        try {
          const response = await axios.post(serverURL + "/vting", sendBody, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              withCredentials: true,
            },
          });
          if (response.status === 201) {
            dispatch(setRestart("delete all!!"));
            dispatch(
              patchGetVote({
                title: response.data.data.title,
                items: response.data.data.items || response.data.data.response,
                sumCount: response.data.data.sumCount || 0,
              })
            );
            navigate(`/v/${response.data.data.url}`);
          }
        } catch (e) {
          return (
            <div>설문 생성에 실패했습니다. 잠시 후 다시 시도해주세요.</div>
          );
        }
      } else if (!isAlertOpen) {
        alert.show();
      }
    }
  };

  const loginVoteBody = () => {
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
          user_id: userInfo.email,
        };
        return sendVoteBody;
      case "open":
        sendVoteBody = {
          title: newVote.title,
          format: newVote.format,
          manytimes: newVote.manytimes,
          user_id: userInfo.email,
        };
        return sendVoteBody;
      case "versus":
        sendVoteBody = {
          title: newVote.title,
          format: newVote.format,
          items: newVote.items,
          manytimes: newVote.manytimes,
          multiple: newVote.multiple,
          user_id: userInfo.email,
        };
        return sendVoteBody;
      case "word":
        sendVoteBody = {
          title: newVote.title,
          format: newVote.format,
          manytimes: newVote.manytimes,
          user_id: userInfo.email,
        };
        return sendVoteBody;
      default:
        return (
          <div>
            설문 생성에 실패했습니다. <br />
            다시 한 번 시도해주세요.
          </div>
        );
    }
  };

  return (
    <div className="vote-button">
      <button
        className={
          everytingIsOk ? "vtingButton" : "vtingButton vtingButtonGray"
        }
        onClick={() => sendNewVote()}
      >
        투표 생성하기
      </button>
    </div>
  );
}

export default VoteButton;
