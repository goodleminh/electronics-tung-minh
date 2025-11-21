/* eslint-disable @typescript-eslint/no-explicit-any */
import { DeleteOutlined, EditOutlined, MoreOutlined } from "@ant-design/icons";
import { Dropdown, Popconfirm, Table, type TableProps } from "antd";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { type AppDispatch, type RootState } from "../../redux/store";
import dayjs from "dayjs";
import {
  actFetchProducts,
  type IProduct,
} from "../../redux/features/product/productSlice";

interface IProductRecord {
  key: number;
  name: string;
  category: string;
  image: string;
  description: string;
  price: number;
  stock: number;
  createdAt: string;
  raw: IProduct;
}
const API_IMG = `http://localhost:3000/public/product`;
const ContentProducts = () => {
  const { products } = useSelector((state: RootState) => state.product);
  const dispatch = useDispatch<AppDispatch>();
  const [tableData, setTableData] = useState<IProductRecord[]>([]);
  // const [editingProduct, setEditingProduct] = useState();

  useEffect(() => {
    const formatted = products.map((p) => ({
      key: p.product_id,
      name: p.name,
      category: "No Category",
      image: p.image || "No img",
      description: p.description || "-",
      price: p.price,
      stock: p.stock,
      createdAt: dayjs(p.created_at).format("DD/MM/YYYY"),
      raw: p,
    }));
    setTableData(formatted);
  }, [products]);

  const columns: TableProps<IProductRecord>["columns"] = [
    {
      title: "Tên sản phẩm",
      dataIndex: "name",
      key: "name",
      render: (_, record) => (
        <div className="flex items-center space-x-3">
          <img
            src={`${API_IMG}/${record.image}`}
            alt={record.name}
            className="w-10 h-10 rounded-lg object-cover "
          />
          <span>{record.name}</span>
        </div>
      ),
    },
    {
      title: "Danh mục",
      dataIndex: "category",
      key: "category",
    },
    {
      title: "Giá",
      dataIndex: "price",
      key: "price",
    },
    {
      title: "Hàng trong kho",
      dataIndex: "stock",
      key: "stock",
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
    },
    {
      title: "actions",
      key: "actions",
      width: 10,
      render: (_, record) => (
        <div className="text-right">
          <Dropdown
            menu={{
              items: [
                {
                  key: "edit",
                  label: "Chỉnh sửa",
                  icon: <EditOutlined />,
                  // onClick: () => handleEdit(record),
                },
                {
                  key: "delete",
                  label: (
                    <Popconfirm
                      title="Bạn có chắc muốn xoá user này không?"
                      okText="Yes"
                      cancelText="No"
                      // onConfirm={() => handleDelete(record)}
                    >
                      <span className="flex items-center text-red-500">
                        <DeleteOutlined className="mr-1" /> Xoá
                      </span>
                    </Popconfirm>
                  ),
                },
              ],
            }}
            trigger={["click"]}
          >
            <MoreOutlined className="cursor-pointer text-lg" />
          </Dropdown>
        </div>
      ),
    },
  ];
  //
  // const handleEdit = (record: IProductRecord) => {
  // setEditingProduct(record);
  // setEditModalVisible(true);
  // };
  //
  // const handleDelete = async (record: IProductRecord) => {};

  // Fetch products
  useEffect(() => {
    dispatch(actFetchProducts());
  }, [dispatch]);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-semibold text-gray-800">Products</h1>
      <div className="bg-white shadow p-5 border border-gray-100 flex items-center justify-between">
        <div className="flex items-center max-w-md w-full px-4 py-3 border border-gray-300 rounded-xl space-x-3">
          <i className="ri-search-line text-xl text-gray-500"></i>
          <input
            type="text"
            placeholder="Search product..."
            className="w-full outline-none text-gray-700"
            // value={searchText}
            // onChange={(e) => setSearchText(e.target.value)}
          />
        </div>

        <button
          // onClick={() => setCreateModalVisible(true)}
          className="px-4 py-3 bg-[#8b2e0f] hover:bg-[#2b2b2b] text-white rounded-xl  cursor-pointer"
        >
          New Product
        </button>
      </div>
      <Table
        columns={columns}
        dataSource={tableData}
        pagination={{
          pageSize: 5, // số item mỗi trang
        }}
      />
    </div>
  );
};
export default ContentProducts;
