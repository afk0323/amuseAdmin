import React, { useEffect, useState } from "react";
import styles from "../../components/ComponentEditing/component.module.css";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import "./ComponentStyle/ListComponentRegister.scss";
import Swal from "sweetalert2";
import axios from "axios";
import { Cookies } from "react-cookie";
const cookies = new Cookies();

interface ItemData {
  item_db_id: number;
  product_code: string;
  startPrice: number;
  title: string;
}

const ListComponentRegister = () => {
  const [title, setTitle] = useState<string>("");
  const [itemIds, setItemIds] = useState<number[]>([]);
  const [pageNumMax, setPageNumMax] = useState(1)
  const [currentActivePage, setCurrentActivePage] = useState(1)
  const [activePageBtns, setActivePageBtns] = useState<Array<any>>([])

  /**
   * Item API
   */
  const [itemData, setItemData] = useState<ItemData[]>([]);
  useEffect(() => {
    axios
    .get(`${process.env.REACT_APP_AMUSE_API}/item/search?page=${currentActivePage}`)
      .then((response) => {
        const responseItem = response.data.data.items;
        setItemData(responseItem);
      })
      .catch((error) => {
        console.log("연결 실패");
      });
  }, []);
  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_AMUSE_API}/test/api/product/getList/byDisplay`, {
        params: {
          limit: 8,
          page: currentActivePage,
          displayStatus: "DISPLAY",
        },
      })
      .then((res) => {
        setPageNumMax(res.data.data.pageCount);
        pageNumberCreat(res.data.data.pageCount)

      });
  }, [currentActivePage]);

  const pageNumberCreat = (pageNumber : number)=>{
    let btns:Array<any> =[]
    for(let i =0 ; i< pageNumber; i++){
      let fontWeight = "normal"
      let fontSize = 12
      let marginBottom = 0
      if(currentActivePage === i+1){
        fontWeight = "bold"
        fontSize = 16
        marginBottom = 4 
      }
      btns.push(
        <div key={"page"+(i+1).toString()} style={{margin:"0 12px",marginBottom:marginBottom,fontWeight:fontWeight,fontSize:fontSize,cursor:"pointer"}} onClick={()=>{setCurrentActivePage(i+1)}}>
          {i+1}
        </div>
      )
    }
    setActivePageBtns(btns)
  }
  /**
   * Component Item Handler
   */
  const [selected, setSelected] = useState<ItemData[]>([]);
  const handleCheckboxChange = (checkedItem: ItemData, checked: boolean) => {
    if (checked) {
      setSelected((prevSelected) => [...prevSelected, checkedItem]);
    } else {
      setSelected((prevSelected) => prevSelected.filter((item) => item.item_db_id !== checkedItem.item_db_id));
    }
  };

  const handleItemReorder = (result: DropResult) => {
    const { source, destination } = result;
    if (!destination) {
      return;
    }

    const dragIndex = source.index;
    const hoverIndex = destination.index;

    const reorderedItems = [...selected];
    const draggedItem = reorderedItems[dragIndex];

    // 순서 변경
    reorderedItems.splice(dragIndex, 1);
    reorderedItems.splice(hoverIndex, 0, draggedItem);

    setSelected(reorderedItems);
  };

  /**
   * Register API
   */

  useEffect(() => {
    setItemIds(selected.map((select) => select.item_db_id));
  }, [selected]);

  console.log(itemIds);

  const handleRegister = () => {
    // 등록할 데이터를 정리합니다.

    const postData = {
      id: null,
      title: title,
      type: "리스트",
      item_db_id: itemIds,
    };
    console.log("쿠키 ", cookies.get("id"));
    // POST 요청을 보냅니다.
    axios
      .post(`${process.env.REACT_APP_AMUSE_API}/test/api/component/register/list`, postData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: cookies.get("id"),
        },
      })
      .then((response) => {
        Swal.fire({
          icon: "success",
          title: "리스트 컴포넌트 생성",
          confirmButtonText: "확인",
          confirmButtonColor: "#F184A1",
        }).then(() => (window.location.href = "/componentV2"));
      })
      .catch((error) => {
        Swal.fire({
          icon: "error",
          title: "리스트 컴포넌트 생성 오류",
          confirmButtonText: "확인",
          confirmButtonColor: "#F184A1",
        });
        console.log("등록 실패");
      });
  };

  const handleMovePage=(num:number)=>{
    if(num > 0){
      if( currentActivePage+1 <= pageNumMax){
        setCurrentActivePage(currentActivePage+1)
      }
    }else if(num < 0){
      if( currentActivePage-1 > 0){
        setCurrentActivePage(currentActivePage-1)
      }
    }
  }
  return (
    <div className="ListComponentRegister">
      <div className={styles.body}>
        <div className="component-list-title">📍 리스트 컴포넌트 생성</div>

        <div className="component-name">
          <p className={styles.p}>
            <div className={styles.pTitle}>컴포넌트 이름</div>
          </p>
          <input
            className="component-name-input"
            type="text"
            name="componentTitle"
            placeholder="컴포넌트 이름을 입력하세요"
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {/* 순서 목록 */}
        <div className="component-order">
          <p className={styles.p}>
            <p className={styles.pTitle}>상품 순서</p>
          </p>

          <div className="component-check-list">
            <DragDropContext onDragEnd={handleItemReorder}>
              <Droppable droppableId="component-check">
                {(provided) => (
                  <div className="component-check" ref={provided.innerRef} {...provided.droppableProps}>
                    {selected.map((select, index) => (
                      <Draggable key={select.item_db_id} draggableId={`component-${select.item_db_id}`} index={index}>
                        {(provided) => (
                          <div
                            className="component-check"
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            {
                              <div className="component-check-item">
                                <div className="item">{select.item_db_id}</div>
                                <div className="item">{select.product_code}</div>
                                <div className="item">{select.title}</div>
                                <div className="item">{select.startPrice}원</div>
                              </div>
                            }
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>
        </div>

        {/* 상품 목록 */}
        <div className="component-item-list">
          <p className={styles.p}>
            <div className={styles.pTitle}>상품 목록</div>
          </p>

          <div className="component-list">
            {itemData.map((item) => (
              <div className="component-item" key={item.item_db_id}>
                <input
                  className="component-check"
                  type="checkbox"
                  onChange={(e) => handleCheckboxChange(item, e.target.checked)}
                  checked={selected.includes(item)}
                />
                <div className="item">{item.item_db_id}</div>
                <div className="item">{item.product_code}</div>
                <div className="item">{item.title}</div>
                <div className="item">{item.startPrice}원</div>
              </div>
            ))}
          </div>
          {pageNumMax >1?
              <div style={{display:"flex",flexDirection:"row",justifyContent:"center",alignItems:"center",width:"100%"}}>
                <div style={{margin:12,cursor:"pointer"}} onClick={()=>{handleMovePage(-1)}}>{"Prev"}</div>
                  <div style={{display:"flex",flexDirection:"row",justifyContent:"center",alignItems:"center",margin:12}}>
                      {activePageBtns.map((item)=>(item))}
                  </div>
                <div style={{margin:12,cursor:"pointer"}} onClick={()=>{handleMovePage(1)}}>{"Next"}</div>
              </div>
              :<></>
            }
        </div>

        <div className="make-delete-button">
          <div className="component-make">
            <button className="component-button" onClick={handleRegister}>
              등록하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListComponentRegister;
