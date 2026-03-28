import { useNavigate } from 'react-router';
import { ArrowRight } from 'lucide-react';
// @ts-ignore
import img1 from '../../assets/ueh green campus.jpg1.jpg';
// @ts-ignore
import img2 from '../../assets/ueh green campus.jpg2.jpg';

export default function IntroPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col relative font-sans">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 flex-1 pb-32 w-full">
        <h1 
          className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-10 text-center tracking-tight" 
          style={{ color: '#1B3A6B' }}
        >
          Thông tin về UEH Green Campus
        </h1>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-10 mb-8 overflow-hidden hover:shadow-lg transition-shadow duration-300">
          <div className="w-full rounded-2xl overflow-hidden mb-8 shadow-sm">
            <img
              src={img1}
              alt="UEH Green Campus Strategy"
              className="w-full h-auto object-cover max-h-[500px] hover:scale-105 transition-transform duration-700"
            />
          </div>

          <p className="text-gray-700 text-base md:text-lg leading-relaxed mb-10 text-justify">
            Chiến lược phát triển bền vững <strong>UEH Green Campus</strong> là một trong những định hướng trọng tâm trong chiến lược “Đại học đa ngành và bền vững giai đoạn 2021–2030” của Trường Đại học Kinh tế TP.HCM. Dự án này được xây dựng theo mô hình Living Lab (phòng thí nghiệm sống), tích hợp các nguyên tắc phát triển bền vững vào toàn bộ hoạt động của nhà trường bao gồm 5 trụ cột chính: đào tạo, nghiên cứu, quản trị, vận hành và kết nối cộng đồng. Không chỉ dừng lại ở việc bảo vệ môi trường, UEH Green Campus hướng đến một hệ sinh thái đại học toàn diện với các giải pháp như quản lý rác thải, năng lượng, phát thải carbon, giao thông xanh, tiêu dùng bền vững và công bằng xã hội. Mục tiêu dài hạn là chuyển đổi từ mô hình “khuôn viên xanh” sang “trung hòa carbon” và tiến tới “net zero carbon”, đồng thời đóng góp vào các Mục tiêu Phát triển Bền vững (SDGs) của Liên Hợp Quốc.
          </p>

          <div className="w-full rounded-2xl overflow-hidden mb-8 shadow-sm">
            <img
              src={img2}
              alt="UEH Trade and Exchange"
              className="w-full h-auto object-cover max-h-[500px] hover:scale-105 transition-transform duration-700"
            />
          </div>

          <p className="text-gray-700 text-base md:text-lg leading-relaxed text-justify">
            Từ định hướng đó, nhóm xây dựng dự án nền tảng website trao đổi – kinh doanh hàng hóa cho cộng đồng sinh viên UEH. Việc khuyến khích sinh viên tận dụng nguồn lực sẵn có từ gia đình, tái sử dụng nguyên vật liệu hoặc sản xuất thủ công không chỉ góp phần giảm thiểu lãng phí tài nguyên mà còn thúc đẩy “tiêu dùng xanh” và “sản xuất có trách nhiệm” – những yếu tố cốt lõi trong chiến lược của UEH. Đồng thời, nền tảng này còn mang lại lợi ích kinh tế rõ rệt khi tạo ra cơ hội gia tăng thu nhập, phát triển kỹ năng kinh doanh và hình thành hệ sinh thái thương mại nội bộ bền vững trong cộng đồng sinh viên. Qua đó, dự án không chỉ phù hợp với tinh thần “công dân UEH xanh” mà còn góp phần hiện thực hóa mô hình kinh tế số kết hợp với phát triển bền vững, nơi giá trị môi trường và giá trị kinh tế được tạo ra song song.
          </p>
        </div>
      </div>

      {/* Fixed Skip Button at bottom right */}
      <div className="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-[100]">
        <button
          onClick={() => navigate('/', { replace: true })}
          className="group flex items-center justify-center gap-2 px-6 py-3.5 md:px-8 md:py-4 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgb(200,162,75,0.4)] transition-all duration-300 hover:-translate-y-1 active:scale-95 text-white font-bold text-sm md:text-base bg-[#C8A24B] border border-[#d6af51]"
          aria-label="Skip to Homepage"
        >
          Trải nghiệm Marketplace
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
        </button>
      </div>
    </div>
  );
}
