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
  const navigate = useNavigate();
  const userInfo = useSelector((state: RootState) => state.userInfo);
  const isLogin = useSelector((state: RootState) => state.isLogin);
  const newVote = useSelector((state: RootState) => state.makeNewVote);
  const newVoteFormat = newVote.format;

  const alert = useAlert();
  const dispatch = useDispatch();

  const serverURL = process.env.SERVER_URL;

  const sendNewVote = async () => {
    if (!everytingIsOk) {
      if (!newVote.title) setTitleShake(true);
      if (setItemShake && newVote.items.length < 2) setItemShake(true);
    } else {
      if (isLogin.login) {
        const sendBody = loginVoteBody();
        const accessToken = localStorage.getItem("accessToken");
        console.log(sendBody);
        console.log(accessToken);

        try {
          const response = await axios.post(serverURL + "/vting", sendBody, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              withCredentials: true,
            },
          });
          if (response.status === 201) {
            console.log(response.data);
            dispatch(setRestart("delete all!!"));
            dispatch(
              patchGetVote({
                title: response.data.data.title,
                items: response.data.data.items || response.data.data.response,
                sumCount: response.data.sumCount || 0,
              })
            );
            navigate(`/v/${response.data.data.url}`);
          }
        } catch (e) {
          console.log(e);
        }
      } else {
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
        console.log("오류 발생 : 투표 포맷이 선택되지 않음");
        return;
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
