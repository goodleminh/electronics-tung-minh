import { Progress } from "antd";
import { useEffect, useState } from "react";
import { fetchOverview } from "../../apis/dashboardApis";
interface Props {
  growth: number;
  target: number;
}

const getTargetMessage = (growth: number) => {
  if (growth < 10) {
    return {
      text: `Cố lên! Chỉ mới +${growth}% so với tháng trước thôi! `,
      color: "#F87171", // đỏ nhạt
    };
  } else if (growth < 40) {
    return {
      text: ` Bạn đạt +${growth}% so với tháng trước! `,
      color: "#FBBF24", // vàng
    };
  } else if (growth < 80) {
    return {
      text: `Tốt lắm! Đạt được +${growth}% so với tháng trước! `,
      color: "#03fcd7", // xanh lam
    };
  } else if (growth < 100) {
    return {
      text: `Xuất sắc! Đạt được +${growth}% mục tiêu so với tháng trước! `,
      color: "#34D399", // xanh nhạt
    };
  } else {
    return {
      text: `Hoàn hảo! Đạt  được +${growth}% so với tháng trước! 🎉`,
      color: "#059669", // xanh đậm
    };
  }
};

export default function MonthlyTarget({ growth, target }: Props) {
  const [percent, setPercent] = useState(0);
  const [revenue, setRevenue] = useState(0);
  const { text, color } = getTargetMessage(growth);

  useEffect(() => {
    fetchOverview().then((res) => {
      const revenue = res.revenueThisMonth;
      // Tính %
      const progress = (revenue / target) * 100;
      setRevenue(revenue);

      setPercent(Number(progress.toFixed(2)));
    });
  }, []);
  return (
    <div className="bg-gray-100 p-6 rounded-xl shadow-sm w-full">
      <h2 className="text-lg font-semibold mb-4">Mục tiêu hàng tháng</h2>

      <div className="flex justify-center w-full h-60 items-center relative">
        <Progress
          type="dashboard"
          percent={percent}
          strokeWidth={13}
          strokeColor={{
            "0%": "#FFD8A9",
            "50%": "#FF9F45",
            "100%": "#FF6F00",
          }}
          trailColor="#FFEED6"
          size={200}
        />
      </div>

      <div className="text-center mt-3">
        <p style={{ color, fontWeight: "bold", fontSize: "16px" }}>{text}</p>
      </div>

      {/* target – revenue */}
      <div className="grid grid-cols-2 rounded-lg mt-5  text-center gap-4">
        <div className="bg-orange-50 p-4">
          <p className="text-gray-600 text-sm">Mục tiêu</p>
          <p className="font-medium">{`${target.toLocaleString("vi-VN")} đ`}</p>
        </div>

        <div className="bg-orange-50 p-4">
          <p className="text-gray-600 text-sm">Doanh thu</p>
          <p className="font-medium">{`${revenue.toLocaleString(
            "vi-VN"
          )} đ`}</p>
        </div>
      </div>
    </div>
  );
}
