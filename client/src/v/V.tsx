import React, {
  useEffect,
  useState,
  createContext,
  Dispatch,
  SetStateAction,
} from "react";
import { useParams } from "react-router-dom";
import { BiShareAlt, BiCopy } from "react-icons/bi";
import "./v.scss";
import {
  useAlert,
  transitions,
  positions,
  AlertOptions,
  Provider as AlertProvider,
} from "react-alert";
import { AlertTemplate, ImgAlertTemplate } from "./AlertTemplate";
import axios from "axios";
import Vresult from "./Vresult";
import Counter from "../Voter/Counter";
import vtCry from "../assets/vt_cry.png";

const imgAlertContext = createContext<any | null>(null);

interface Item {
  idx: number;
  content: string;
  count?: number;
}

interface VoteInfo {
  _id?: string;
  user_id?: string;
  password?: string;
  url?: number;
  title?: string;
  format?: string;
  type?: string;
  items?: Item[];
  multiple?: boolean;
  manytimes?: boolean;
  undergoing?: boolean;
  isPublic?: boolean;
  created_at?: string;
}

const dummyVote: VoteInfo = {
  _id: "",
  user_id: "",
  password: "",
  url: 0,
  title: "",
  format: "",
  type: "",
  items: [],
  multiple: false,
  manytimes: false,
  undergoing: false,
  isPublic: false,
  created_at: "",
};

interface Props {
  setIsNonUser: Dispatch<SetStateAction<boolean>>;
  votePass: string | undefined;
}

// 컴포넌트 시작
function V() {
  const { code } = useParams();
  const [isRealTime, setIsRealTime] = useState(false);
  const [togglePublic, setTogglePublic] = useState(true);
  const [toggleOngoing, setToggleOngoing] = useState(true);
  const [voteTitle, setVoteTitle] = useState("");
  const [voteInfo, setVoteInfo] = useState(dummyVote);
  const [voteSumCount, setVoteSumCount] = useState(0);
  const [isNonUser, setIsNonUser] = useState(false);
  const [overtime, setOvertime] = useState(0);
  const [somethingWrong, setSometingWrong] = useState(false);

  const serverURL = process.env.SERVER_URL;
  const accessToken = localStorage.getItem("accessToken");

  useEffect(() => {
    const voteResult = async () => {
      try {
        const response = await axios.get(`${serverURL}/vting/${code}`, {
          headers: {
            Authorization: accessToken ? `Bearer ${accessToken}` : "",
            withCredentials: true,
          },
        });

        // 응답 객체에 password가 있으면 -> 비회원 설문조사임
        if (response.status === 200 && response.data.data.password) {
          setVoteInfo(response.data.data);
          setVoteTitle(response.data.data.title);
          setToggleOngoing(response.data.data.undergoing);
          setTogglePublic(response.data.data.isPublic);
          setOvertime(response.data.overtime);
          // 비회원 설문조사 모드 (비밀번호 입력창) 활성화
          setIsNonUser(true);
        } else if (response.status === 200 && response.data.data.user_id) {
          setVoteInfo(response.data.data);
          setVoteTitle(response.data.data.title);
          setToggleOngoing(response.data.data.undergoing);
          setTogglePublic(response.data.data.isPublic);
          // sumCount가 있는 설문이면 가져오기
          if (response.data.sumCount) setVoteSumCount(response.data.sumCount);
        } else {
          setSometingWrong(true);
        }
      } catch (e) {
        setSometingWrong(true);
      }
    };

    voteResult();
  }, []);

  const clickedTogglePublic = async () => {
    try {
      const response = await axios.patch(
        `${serverURL}/vting/${code}`,
        {
          isPublic: "clicked!",
          isActive: null,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            withCredentials: true,
          },
        }
      );
      if (response.status === 200) {
        setTogglePublic(response.data.isPublic);
      }
    } catch (e) {
      console.log(e);
    }
  };

  const clickedToggleOngoing = async () => {
    if (voteInfo.password) {
      try {
        const response = await axios.patch(
          `${serverURL}/vting/${code}`,
          {
            isPublic: null,
            isActive: "clicked!",
          },
          {
            headers: {
              withCredentials: true,
            },
          }
        );
        if (response.status === 200) {
          setToggleOngoing(response.data.isActive);
        }
      } catch (e) {
        console.log(e);
      }
    } else {
      try {
        const response = await axios.patch(
          `${serverURL}/vting/${code}`,
          {
            isPublic: null,
            isActive: "clicked!",
          },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              withCredentials: true,
            },
          }
        );
        if (response.status === 200) {
          setToggleOngoing(response.data.isActive);
        }
      } catch (e) {
        console.log(e);
      }
    }
  };

  // Alert Options
  const options: AlertOptions = {
    position: positions.TOP_CENTER,
    timeout: 3000,
    offset: "70px",
    transition: transitions.SCALE,
  };
  const imgoptions: AlertOptions = {
    position: positions.MIDDLE,
    // timeout: 3000,
    // offset: "70px",
    transition: transitions.SCALE,
  };

  return (
    <AlertProvider template={AlertTemplate} {...options}>
      <AlertProvider
        template={ImgAlertTemplate}
        {...imgoptions}
        context={imgAlertContext}
      >
        {somethingWrong ? (
          <div className="bodyContainer">
            <div className="voteResultPageCon">
              <div className="voteResultPage">
                <div className="voteResultTitle">잘못된 접근입니다.</div>
                <div className="voteResultContent">
                  <div className="errorCon">
                    <div className="imgCon">
                      <img src={vtCry} alt="somethingw wrong" />
                    </div>
                    <div>
                      <span className="errorTitle">
                        Ooooops... Something went wrong.
                      </span>
                      <br />
                      해당 코드를 가진 설문이 없거나 만료된 설문입니다.
                      <br />
                      설문 코드를 다시 확인해주시기 바랍니다. <br />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : isNonUser ? (
          <div className="bodyContainer">
            <div className="voteResultPageCon">
              <div className="voteResultPage">
                <div className="voteResultTitle">비회원 설문 관리 페이지</div>
                <div className="voteResultContent">
                  <PasswordCheck
                    setIsNonUser={setIsNonUser}
                    votePass={voteInfo.password}
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bodyContainer">
            <div className="voteResultPageCon">
              <div className="voteResultPage">
                <div className="voteResultTitle">{voteTitle}</div>
                <div className="voteResultContent">
                  {isRealTime ? <Vresult /> : <Howto />}
                </div>
              </div>
              <div className="voteResultFooter">
                <div className="modeChange">
                  <div
                    className={isRealTime ? "modebtn gray" : "modebtn"}
                    onClick={() => setIsRealTime(false)}
                  >
                    Vting 접속 방법
                  </div>
                  <div
                    className={isRealTime ? "modebtn" : "modebtn gray"}
                    onClick={() => setIsRealTime(true)}
                  >
                    실시간 응답 보기
                  </div>
                </div>
                {voteInfo.password ? (
                  <div className="options">
                    <div>
                      <Counter overtime={overtime} />
                    </div>
                    <button
                      onClick={() => clickedToggleOngoing()}
                      className="toggleBtn"
                    >
                      <div
                        className={
                          toggleOngoing
                            ? "toggleCircle"
                            : "toggleCircle toggleOn"
                        }
                      >
                        {toggleOngoing ? "진행중" : "재시작"}
                      </div>
                    </button>
                  </div>
                ) : (
                  <div className="options">
                    <button
                      onClick={() => clickedTogglePublic()}
                      className="toggleBtn"
                    >
                      <div
                        className={
                          togglePublic
                            ? "toggleCircle"
                            : "toggleCircle toggleOn"
                        }
                      >
                        {togglePublic ? "공개" : "비공개"}
                      </div>
                    </button>
                    <button
                      onClick={() => clickedToggleOngoing()}
                      className="toggleBtn"
                    >
                      <div
                        className={
                          toggleOngoing
                            ? "toggleCircle"
                            : "toggleCircle toggleOn"
                        }
                      >
                        {toggleOngoing ? "진행중" : "재시작"}
                      </div>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </AlertProvider>
    </AlertProvider>
  );
}

function Howto() {
  const [imgUrl, setImgUrl] = useState("");
  const { code } = useParams();
  const alert = useAlert();
  const imgAlert = useAlert(imgAlertContext);

  let codeString = "";
  if (code) codeString = code.toString();

  // param에서 코드 받아와서 주소 만들기
  const shortUrl = "https://vote.v-ting.net/" + codeString;

  // QR 코드 생성
  const QRCode = require("qrcode");
  useEffect(() => {
    QRCode.toDataURL(shortUrl, function (err: Error, url: string) {
      setImgUrl(url);
    });
  }, [shortUrl]);

  // 클립보드에 복사
  function shortUrlClip() {
    try {
      navigator.clipboard.writeText(shortUrl);
      alert.show("접속주소가 클립보드에 복사되었습니다.");
    } catch (e) {
      alert.show("에러가 발생했습니다. 잠시 후 다시 시도해주세요.");
    }
  }

  function codeClip() {
    try {
      navigator.clipboard.writeText(codeString);
      alert.show("접속코드가 클립보드에 복사되었습니다.");
    } catch (e) {
      alert.show("에러가 발생했습니다. 잠시 후 다시 시도해주세요.");
    }
  }

  async function quBlobClip() {
    try {
      const imgURL = imgUrl;
      const data = await fetch(imgURL);
      const blob = await data.blob();
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob,
        }),
      ]);
      alert.show("QR 코드가 클립보드에 복사되었습니다.");
    } catch (err) {
      alert.show("에러가 발생했습니다. 잠시 후 다시 시도해주세요.");
    }
  }

  // qr코드 클릭 시 확대
  function zoomQr() {
    const qrimgDiv = <img src={imgUrl} alt={shortUrl} />;
    imgAlert.show(qrimgDiv, {
      close: () => {
        alert.remove(imgAlert);
      },
    });
  }

  return (
    <>
      <div className="voteResultChild voteResultShort">
        <div className="voteResultChildTitle">Short URL</div>
        <div className="voteResultChildContent">
          vote.v-ting.net/
          <br />
          {code}
        </div>
        <div className="voteResultChildShare">
          <div className="copy" onClick={() => shortUrlClip()}>
            <BiCopy />
          </div>
          <div className="sns">
            <BiShareAlt />
          </div>
        </div>
        <div className="voteResultChildEx">
          인터넷 주소창에
          <br />위 주소를 기입하여 접속
        </div>
      </div>
      <div className="hrVer"></div>
      <div className="voteResultChild voteResultCode">
        <div className="voteResultChildTitle">Vting Code</div>
        <div className="voteResultChildContent">{code}</div>
        <div className="voteResultChildShare">
          <div className="copy" onClick={() => codeClip()}>
            <BiCopy />
          </div>
          <div className="sns">
            <BiShareAlt />
          </div>
        </div>
        <div className="voteResultChildEx">
          vote.v-ting.net에 접속 후<br />
          코드 입력란에 위 코드를 기입하여 접속
        </div>
      </div>
      <div className="hrVer"></div>
      <div className="voteResultChild voteResultQr">
        <div className="voteResultChildTitle">QR Code</div>
        <div className="voteResultChildContent voteResultChildQr">
          <img src={imgUrl} alt="qr" onClick={() => zoomQr()} />
        </div>
        <div className="voteResultChildShare">
          <div className="copy" onClick={() => quBlobClip()}>
            <BiCopy />
          </div>
          <div className="sns">
            <BiShareAlt />
          </div>
        </div>
        <div className="voteResultChildEx">
          QR 코드를 휴대폰 카메라로 촬영해
          <br /> 연결되는 페이지로 접속
        </div>
      </div>
    </>
  );
}

function PasswordCheck({ setIsNonUser, votePass }: Props) {
  const [password, setPassword] = useState("");
  const alert = useAlert();

  // 비회원 비밀번호 체크 로직
  function checkingPassword(password: string) {
    if (password === votePass) {
      setIsNonUser(false);
    } else {
      alert.show("비밀번호를 다시 확인해주세요.");
    }
  }

  return (
    <div className="nonUserPasswordCon">
      <div className="nonUserPasswordText">
        비회원 설문 관리 페이지에 입장하시려면
        <br />
        설문 시 생성한 임시 비밀번호를 입력하세요.
      </div>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={() => checkingPassword(password)}>확인</button>
    </div>
  );
}

export default V;
