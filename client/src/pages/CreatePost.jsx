import { Alert, Button, FileInput, Select, TextInput } from "flowbite-react"
import { useState } from "react";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { app } from "../firebase";
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from "firebase/storage";
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";


const CreatePost = () => {
    const postCategories = ["JavaScript","TypeScript","HTML", "CSS", "React", "Angular"]

    const [imageFile, setImageFile] = useState(null);
    const [imageUploadProgress, setImageUploadProgress] = useState(null);
    const [imageUploadError, setImageUploadError] = useState(null);
    const [imageFileUrl, setImageFileUrl] = useState(null);
    const [imageUploading, setImageUploading] = useState(false);
    const [formdata, setFormData] = useState({})

    const handleImageUpload = async () =>{ 
      if (!imageFile) {
        setImageUploadError("Please select an image")
        return
      }
      const storage = getStorage(app);
      const fileName = imageFile.name + new Date().getTime();
      const storageRef = ref(storage, fileName);
      const uploadTask = uploadBytesResumable(storageRef, imageFile);
      try {
        setImageUploading(true)
        setImageUploadError(null)
        uploadTask.on(
        "state_changed",
        (snapshot)=>{
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes)*100;
          setImageUploadProgress(progress.toFixed(0));
        },
        (error) => {
          setImageUploadError(error.message);
          setImageUploadProgress(null);
          setImageUploading(false);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadUrl) => {
            setImageFileUrl(downloadUrl);
            setImageUploadProgress(null);
            setImageUploadError(null);
            setImageUploading(false);
            setFormData({...formdata, image:downloadUrl})
          })
        }
      )
      } catch (error) {
        setImageUploadError(error.message);
        setImageUploadProgress(null);
        setImageUploading(false);
      }
    }
  return (
    <div className="w-full min-h-screen mx-auto max-w-3xl p-4 space-y-5">
      <h1 className="text-3xl font-semibold">Create a Post</h1>
      <form className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-4">
            <TextInput type="text" placeholder="Title" required id="title" className="flex-1" />
            <Select>
                <option value={"uncategorized"} disabled>Select a category</option>
                {
                    postCategories.map((item) => {
                        return <option key={item} value={item.toLocaleLowerCase()}>{item}</option>
                    })
                }
            </Select>
        </div>
        <div className="flex gap-4 items-center justify-between border-4
        border-dotted border-teal-500 p-3">
            <FileInput onChange={(e) => {setImageFile(e.target.files[0])}} type='file' accept="image/*" />
            <Button type="button" gradientDuoTone={'purpleToBlue'} size={'sm'} outline
            onClick={handleImageUpload}
            disabled={imageUploading}
            >
                {
                  imageUploadProgress ? (
                    <div className="w-8 h-8">
                      <CircularProgressbar 
                      value={imageUploadProgress}
                      text={`${imageUploadProgress || 0}%`}
                      />
                    </div>
                  ) :(
                    "Upload image"
                  )
                }
            </Button>
        </div>
        {
          imageUploadError && 
          <Alert color={'failure'}>
            {imageUploadError}
          </Alert>
        }
        {
          formdata.image && (
            <img 
            src={formdata.image}
            alt="upload"
            className="w-full h-72 object-cover"
            loading="lazy"
            />
          )
        }
        <ReactQuill
        className="h-72 mb-12"
        theme="snow" placeholder="Write your blog description"
        required />
        <Button type="submit" gradientDuoTone={'purpleToPink'} disabled={imageUploading}>Publish</Button>
      </form>
    </div>
  )
}

export default CreatePost