import axios from "axios";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../store/index";
import "./Dashboard.scss";

const serverURL: string = process.env.SERVER_URL as string;

function Dashboard() {
  const navigate = useNavigate();

  const isLogin = useSelector((state: RootState) => state.isLogin);

  const [signInState, setSignInState] = useState<boolean>(false);

  // todo: 임의로 불러오는 데이터
  let votes = [
    {
      created_at: "2022-03-11T10:23:49.027Z",
      format: "bar",
      isPublic: true,
      title: "막대그래프 예시",
      undergoing: true,
      url: 123456,
    },
    {
      created_at: "2022-03-19T13:13:09.463Z",
      format: "open",
      isPublic: true,
      title: "오픈 예시",
      undergoing: true,
      url: 234567,
    },
    {
      created_at: "2022-03-31T13:13:22.078Z",
      format: "word",
      isPublic: false,
      title: "워드클라우드 예시",
      undergoing: false,
      url: 345678,
    },
  ];

  const [userVote, setUserVote] = useState(votes);

  let newVotes = userVote.map((vote, index) => ({
    key: index,
    created_at: vote.created_at.toString().split("T")[0],
    format: changeFormat(vote.format),
    isPublic: vote.isPublic === true ? "공개" : "비공개",
    title: vote.title,
    undergoing: vote.undergoing === true ? "종료" : "재시작",
    url: vote.url,
  }));

  function changeFormat(type: string) {
    if (type === "bar") return "막대 그래프";
    if (type === "open") return "대화형";
    if (type === "word") return "말풍선";
    if (type === "versus") return "대결형";
  }

  // * 페이지네이션
  const [currentPage, setCurrentPage] = useState(1);
  const [userVoteCount, setUserVoteCount] = useState(1);
  let totalPage: number = Math.ceil(userVoteCount / 10);

  const [buttonActive, setButtonActive] = useState(false);

  const showPageBtn = () => {
    let pages: React.ReactElement<any>[] = [];
    for (let i: number = 1; i <= totalPage; i++) {
      pages.push(
        <li>
          <button
            className={buttonActive ? "page_btn" : "page_btn"}
            onClick={() => getChangePage(i)}
          >
            {i}
          </button>
        </li>
      );
    }
    return pages;
  };

  // * 보트들의 정보 조회하기
  const getUserInfo = async () => {
    let accessToken = localStorage.getItem("accessToken");
    try {
      const res = await axios.get(`${serverURL}/user?q=1`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          withCredentials: true,
        },
      });
      if (res.status === 200) {
        setUserVote(res.data.vote);
        getChangePage(currentPage);
      } else {
        setUserVote(votes);
      }
    } catch (err) {
      console.log(err);
    }
  };

  // * 페이지네이션
  const getChangePage = async (pageNumber: number) => {
    let accessToken = localStorage.getItem("accessToken");
    try {
      const res = await axios.get(`${serverURL}/user?q=${pageNumber}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          withCredentials: true,
        },
      });
      if (res.status === 200) {
        setButtonActive(true);
        setCurrentPage(pageNumber);
        setUserVote(res.data.vote);
      } else {
        // setUserVote(votes);
      }
    } catch (err) {
      console.log(err);
    }
  };

  // * 보트의 총 개수만 조회하기
  const getVoteCount = async () => {
    let accessToken = localStorage.getItem("accessToken");
    try {
      const res = await axios.get(`${serverURL}/user`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          withCredentials: true,
        },
      });
      if (res.status === 200) {
        // todo: 보트들 개수 저장해두기
        setUserVoteCount(res.data.data.voteCount);
      } else {
        setUserVote(userVote);
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (!isLogin.login) {
      setSignInState(false);
    } else {
      setSignInState(true);
    }
    getUserInfo();
    getVoteCount();
  }, [userVoteCount]);

  // todo: Vote Table 에서 설문 생성, 설문 종료, 설문 삭제 기능 구현하기
  const DeleteVote = async (url: number) => {
    let accessToken = localStorage.getItem("accessToken");
    try {
      const res = await axios.delete(`${serverURL}/vting/${url}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          withCredentials: true,
        },
      });
      if (res.status === 200) {
        getUserInfo();
        closeModal();
      }
    } catch (err) {
      console.log(err);
    }
  };

  // * 퍼블릭 패치
  const memberPublic = async (url: number) => {
    let accessToken = localStorage.getItem("accessToken");
    try {
      const res = await axios.patch(
        `${serverURL}/vting/${url}`,
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
      if (res.status === 200) {
        getUserInfo();
      } else {
        console.log("Bad Request");
      }
    } catch (err) {
      console.log(err);
    }
  };

  // * 액티브 패치
  const memberActive = async (url: number) => {
    let accessToken = localStorage.getItem("accessToken");
    try {
      const res = await axios.patch(
        `${serverURL}/vting/${url}`,
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
      if (res.status === 200) {
        getUserInfo();
      } else {
        console.log("Bad Request");
      }
    } catch (err) {
      console.log(err);
    }
  };

  // * 삭제 모달
  const [openModal, setOpenModal] = useState<boolean>(false);

  const [deleteURL, setDeleteURL] = useState<number>(0);

  const deleteHandler = (url: number) => {
    setDeleteURL(url);
    setOpenModal(true);
  };

  const closeModal = () => {
    setOpenModal(false);
  };

  return (
    <>
      {signInState ? (
        <div className="dashboard_container">
          <header className="dashboard_header">
            <h1>나의 V-ting</h1>
          </header>

          <main className="dashboard_wrap">
            <div onClick={() => navigate("/new")} className="dashboard_btnWrap">
              <button className="dashboard_plusBtn">
                Let's create a V-ting!
              </button>
            </div>
            <table className="dashboard_table">
              <thead>
                <tr>
                  <th style={{ width: "20px" }}>No.</th>
                  <th style={{ width: "350px" }}>Title</th>
                  <th style={{ width: "120px" }}>Type</th>
                  <th style={{ width: "20px" }}>Created_At</th>
                  <th style={{ width: "20px" }}>Code</th>
                  <th style={{ width: "20px" }}>isPublic</th>
                  <th style={{ width: "20px" }}>isActive</th>
                  <th style={{ width: "20px" }}>Delete</th>
                </tr>
              </thead>

              {newVotes.map((vote: any, index) => (
                <tbody key={index + (currentPage - 1) * 10 + 1}>
                  <tr>
                    <td>{index + (currentPage - 1) * 10 + 1}</td>
                    <td
                      onClick={() => navigate(`/v/${vote.url}`)}
                      className="td_title"
                    >
                      {vote.title}
                    </td>
                    <td>{vote.format}</td>
                    <td>{vote.created_at}</td>
                    <td>{vote.url}</td>
                    <td onClick={() => memberPublic(vote.url)}>
                      <button className="toggleBtn">
                        <div
                          className={
                            vote.isPublic === "공개"
                              ? "toggleCircle"
                              : "toggleCircle toggleOn"
                          }
                        ></div>
                      </button>
                    </td>
                    <td onClick={() => memberActive(vote.url)}>
                      <button className="toggleBtn">
                        <div
                          className={
                            vote.undergoing === "종료"
                              ? "toggleCircle"
                              : "toggleCircle toggleOn"
                          }
                        ></div>
                      </button>
                    </td>
                    <td>
                      <input
                        className="dashboard_deleteBtn"
                        type="button"
                        value="삭제"
                        onClick={() => deleteHandler(vote.url)}
                      />
                    </td>
                  </tr>
                </tbody>
              ))}
            </table>
            {openModal && (
              <div className="dashboard_deleteModal_container">
                <div className="dashboard_deleteModal_background">
                  <div className="dashboard_deleteModal_modal">
                    <button
                      className="deleteModal_closeBtn"
                      onClick={closeModal}
                    >
                      X
                    </button>
                    <div className="dashboard_deleteModal_desc">
                      <h3>
                        코드번호 : {deleteURL} <br />
                        삭제시, 복구되지 않습니다.
                        <br /> 정말로 삭제하시겠습니까?
                      </h3>
                    </div>
                    <div className="btnWrap">
                      <button
                        className="dashboard_delete_ok"
                        onClick={() => DeleteVote(deleteURL)}
                      >
                        확인
                      </button>
                      <button
                        className="dashboard_delete_cancel"
                        onClick={closeModal}
                      >
                        취소
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <ul className="pagination">{showPageBtn()}</ul>
          </main>
        </div>
      ) : (
        <div className="dashboardModal_container">
          <div className="dashboardModal_background">
            <div className="dashboardModal_modal">
              <button
                className="dashboardModal_closeBtn"
                onClick={() => navigate("/")}
              >
                X
              </button>
              <div className="dashboardModal_desc">
                <h3>로그인 후, 이용하실 수 있습니다.</h3>
              </div>
              <div className="dashboardModal_btnWrap">
                <button
                  className="dashboardModal_ok"
                  onClick={() => navigate("/signIn")}
                >
                  확인
                </button>
                <button
                  className="dashboardModal_cancel"
                  onClick={() => navigate("/")}
                >
                  취소
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Dashboard;
