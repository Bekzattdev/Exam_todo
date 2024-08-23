"use client";
import axios from "axios";
import styles from "./AddProduct.module.scss";
import { useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";

const UPLOAD_URL = "https://api.elchocrud.pro/api/v1/";
const BACKEND_URL =
  "https://api.elchocrud.pro/api/v1/aff7a94df2f4543cfe4c99f15b364a09/examen";

interface TodoType {
  _id?: number;
  title: string;
  img: string;
  isCompleted: boolean;
}

const AddProduct = () => {
  const [todos, setTodos] = useState<TodoType[]>([]);
  const [isEditId, setIsEditId] = useState<null | number>(null);
  const { register: registerAdd, handleSubmit: handleSubmitAdd } =
    useForm<TodoType>();

  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    setValue,
  } = useForm<TodoType>();

  const onSubmitAdd: SubmitHandler<TodoType> = async (data) => {
    const file = data.img[0];
    const formData = new FormData();
    formData.append("file", file);

    const { data: responseImage } = await axios.post(
      `${UPLOAD_URL}/upload/file`,
      formData
    );

    const newData = {
      title: data.title,
      isCompleted: false,
      img: responseImage.url,
    };

    const { data: responseTodos } = await axios.post(BACKEND_URL, newData);
    setTodos(responseTodos);
  };

  const handleComplete = async (_id: number, isCompleted: boolean) => {
    const updateData = {
      isCompleted: !isCompleted,
    };

    const { data } = await axios.patch(`${BACKEND_URL}/${_id}`, updateData);
    setTodos(data);
  };

  const handleDelete = async (_id: number) => {
    await axios.delete(`${BACKEND_URL}/${_id}`);
    setTodos((prevTodos) => prevTodos.filter((todo) => todo._id !== _id));
  };

  const fetchTodos = async () => {
    const { data } = await axios.get(BACKEND_URL);
    setTodos(data);
    console.log(data);
  };

  const onSubmitEdit: SubmitHandler<TodoType> = async (data) => {
    const file = data.img[0];
    const formData = new FormData();
    formData.append("file", file);

    const { data: responseImage } = await axios.post(
      `${UPLOAD_URL}/upload/file`,
      formData
    );

    const editData = {
      title: data.title,
      img: responseImage.url,
    };

    const { data: responseTodos } = await axios.patch(
      `${BACKEND_URL}/${isEditId}`,
      editData
    );
    setTodos(responseTodos);
    setIsEditId(null);
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  return (
    <div className={styles.todoList}>
      <h1>Todo List</h1>
      <form onSubmit={handleSubmitAdd(onSubmitAdd)}>
        <input
          placeholder="Название"
          type="text"
          {...registerAdd("title", { required: true })}
        />
        <input type="file" {...registerAdd("img", { required: true })} />
        <button type="submit">Добавить</button>
      </form>
      <div className={styles.content}>
        {todos.map((item) => (
          <div
            key={item._id!}
            className={
              item.isCompleted
                ? `${styles.todoItem} ${styles.completed}`
                : `${styles.todoItem}`
            }
          >
            {item._id === isEditId ? (
              <>
                <form onSubmit={handleSubmitEdit(onSubmitEdit)}>
                  <input
                    placeholder="Edit title"
                    {...registerEdit("title", { required: true })}
                    type="text"
                  />
                  <input
                    placeholder="Edit image"
                    {...registerEdit("img", { required: true })}
                    type="file"
                  />
                  <button type="submit">Сохранить</button>
                  <button type="button" onClick={() => setIsEditId(null)}>
                    Закрыть
                  </button>
                </form>
              </>
            ) : (
              <>
                <h1>{item.title}</h1>
                <img src={item.img} alt={item.title} />

                <button
                  onClick={() => {
                    setIsEditId(item._id!);
                    setValue("title", item.title);
                  }}
                >
                  Изменить
                </button>
                <button onClick={() => handleDelete(item._id!)}>Удалить</button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AddProduct;
