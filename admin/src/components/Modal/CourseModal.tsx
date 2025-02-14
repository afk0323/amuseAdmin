import { useEffect, useState } from 'react';
import styles from './CourseModal.module.css';
import _ from 'lodash';

interface ImageFile {
  fileName: string,
  base64Data: string
  imgUrl:string | undefined
}

type Location  = {
  latitude: string,
  longitude: string
}

interface Course {
  id: number | null;
  sequenceId: number;
  day: number;
  title: string;
  timeCost: string;
  content: string;
  image: ImageFile;
  location: {
    latitude: string;
    longitude: string;
  }
}

type MordalProps = {
  onSave(course:Course,isEdit:boolean): void,
  onToggle(): void,
  courseCount: number,
  isEdit:boolean,
  editCourseId:number|null,
  courseProps:any
};

function CourseModal({courseCount, onSave, onToggle, isEdit,editCourseId,courseProps}: MordalProps) {
  const [sequenceId, setSequenceId] = useState<number>(0);
  useEffect(() => {
    setSequenceId(courseCount);
  },[courseCount])
  const [title, setTitle] = useState<string>('');
  const [timeCost, setTimeCost] = useState<string>('');
  const [location, setLocation] = useState<Location>({
    latitude: '',
    longitude: ''
  });

  const [content, setContent] = useState<string>('');
  const [image, setImage] = useState<ImageFile | undefined>();
  
  const handleTitle = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(event.currentTarget.value);
  };

  const handleContent = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(event.currentTarget.value);
  };

  const handleTimeCost = (event: React.ChangeEvent<HTMLInputElement>) => {
    let input = event.currentTarget.value
    setTimeCost(input);
  };

  const handleLatitude = (event: React.ChangeEvent<HTMLInputElement>) => {
    let input = event.target.value
    setLocation((prev) => ({
      ...prev,
      latitude: input.replace(/[^0-9.]/g,"")
    }))
  }

  const handleLongitude = (event: React.ChangeEvent<HTMLInputElement>) => {
    let input = event.target.value
    setLocation((prev) => ({
      ...prev,
      longitude: input.replace(/[^0-9.]/g,"")
    }))
  }

  const handleImg = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const imageFile = await new Promise <ImageFile>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve({fileName: file.name, base64Data: reader.result as string,imgUrl: undefined});
          };
          reader.readAsDataURL(file);
        });
        setImage(imageFile);
      }
      catch(error) {
        console.error("Error reading the image file: ", error);
        setImage(undefined);
      }
    } 
    else {
      setImage(undefined);
    }
  }

  const [day, setDay] = useState<number>(1);

  const handleDay = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDay(Number(event.target.value));
  }
  
  const handleSave = () => {
    if(title.length > 0 && content.length && timeCost && image){
      let courseId = null
      if(isEdit){courseId = editCourseId}
      const course:Course = {
        id: courseId,
        sequenceId,
        day: day,
        title: title,
        timeCost: timeCost,
        location: location,
        content: content,
        image: image
      };
      onSave(course,isEdit);
    }
  };
  useEffect(()=>{
    if(isEdit){
      let item = _.find(courseProps,{id:editCourseId})
      console.log(item)
      setTitle(item.title || "")
      setContent(item.content || "")
      setTimeCost(item.timeCost || 0)
      setLocation(item.location || { latitude: "", longitude: ""})
      setImage(item.image || undefined)
      setDay(item.day || 1)
      setSequenceId(item.sequenceId || sequenceId)
    }
  },[editCourseId])

  return (
    <>
      <div className={styles.modal}>
        <header className={styles.header}>
          <span className={styles.headerTitle}>코스 관리</span>
          <button className={styles.exitBtn} onClick={onToggle}>나가기</button>
        </header>
        <div className={styles.body}>
          <div className={`${styles.container} ${styles.title}`}>
            <p className={styles.label}>코스 제목</p>
            <input className={`${styles.input} ${styles.title}`} value={title} onChange={handleTitle} type="text" />
          </div>
          <div className={`${styles.container} ${styles.timeCostAndDay}`}>
            <div>
              <p className={styles.label}>코스 소요시간</p>
              <input className={`${styles.input} ${styles.timeCost}`} value={timeCost} onChange={handleTimeCost} type="text" placeholder='코스 소요시간을 입력하세요.' />
            </div>
            <div>
              <p className={styles.label}>시기</p>
              <input className={`${styles.input} ${styles.day}`} value={day} onChange={handleDay} type="text" placeholder='코스 소요시간을 입력하세요.' />
              <span>일차</span>
            </div>
          </div>
          <div className={`${styles.container} ${styles.location}`}>
            <div className={styles.latitude}>
              <p className={styles.label}>위도값</p>
              <input className={`${styles.input} ${styles.latitude}`} value={location.latitude} onChange={handleLatitude} type="text" placeholder='위도값을 입력하세요.' />
            </div>
            <div className={styles.longitude}>
              <p className={styles.label}>경도값</p>
              <input className={`${styles.input} ${styles.longitude}`} value={location.longitude} onChange={handleLongitude} type="text" placeholder='경도값을 입력하세요.' />
            </div>
          </div>
          <div className={`${styles.container} ${styles.content}`}>
            <p className={styles.label}>코스 설명</p>
            <textarea className={`${styles.input} ${styles.content}`} value={content} onChange={handleContent}></textarea>
          </div>
          <div className={`${styles.container} ${styles.img}`}>
            <div style={{display:"flex",flexDirection:"row",justifyContent:"space-between"}}>
              <span className={` ${styles.label} ${styles.img}`} style={{display:"flex",alignItems:"center"}}>코스 이미지</span>
              <input className={styles.imgInput} style={{marginBottom:12}} id="imgInput" onChange={handleImg} accept="image/png, image/jpeg" type="file"/>
            </div>
            {image && <img className={styles.currentImg} src={image.base64Data || image.imgUrl} alt="Course" />}
          </div>       
        </div>
        {isEdit? <button className={styles.saveBtn} onClick={handleSave}>수정</button> : <button className={styles.saveBtn} onClick={handleSave}>추가</button>}
        
      </div>
      <div className={styles.backDrop}></div>
    </>
  );
}

export default CourseModal;