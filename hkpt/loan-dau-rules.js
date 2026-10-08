/**
 * loan-dau-rules.js
 * Hệ thống Luận Giải & Gợi Ý Loan Đầu Ngoại Cục (Hình Thế Môi Trường Xung Quanh Nhà)
 * Dựa trên nguyên tắc cốt lõi: "Thu Sơn Xuất Sát" và Tinh Bàn Huyền Không Phi Tinh.
 */

(function() {
  'use strict';

  /**
   * Phân tích Loan Đầu ngoại cục dựa trên Tinh Bàn Phi Tinh
   * @param {Object} chartResult - Kết quả tính tinh bàn từ tinhban.js
   * @returns {Object} Kết quả phân tích Loan Đầu
   */
  function analyzeLoanDau(chartResult) {
    if (!chartResult || !chartResult.palaces) return null;

    const vanTrach = chartResult.van || 9;
    const palaces = chartResult.palaces;
    const facingDegree = chartResult.facingDegree || 0;

    // 1. Phân loại sao theo Vận
    const saoVuongKhi = vanTrach;
    const saoSinhKhi_1 = (vanTrach % 9) + 1;
    const saoSinhKhi_2 = (saoSinhKhi_1 % 9) + 1;
    const saoCatTinh = [1, 6, 8, 9];
    const saoBaoSat = [2, 5];

    const palaceDirections = [];
    const needMountain = [];
    const needWater = [];
    const needQuiet = [];

    // Duyệt 8 phương vị (1-4, 6-9)
    for (let p = 1; p <= 9; p++) {
      if (p === 5) continue; // Bỏ qua Trung Cung trong Loan Đầu Ngoại Cục

      const pal = palaces[p];
      if (!pal) continue;

      const son = pal.son;
      const huong = pal.huong;
      const van = pal.van;
      const name = pal.palaceName;
      const dir = pal.palaceDirection;

      let requirementType = 'balance'; // 'mountain' | 'water' | 'quiet' | 'balance'
      let reqBadge = { text: '⚖️ CẦN BÌNH HÒA', type: 'neutral' };
      let priorityText = 'Trung bình';
      let idealLandscape = '';
      let avoidLandscape = '';
      let explanation = '';
      let score = 70;

      const isSonVuong = (son === saoVuongKhi || son === saoSinhKhi_1);
      const isHuongVuong = (huong === saoVuongKhi || huong === saoSinhKhi_1);
      const isHuongSat = saoBaoSat.includes(huong);
      const isSonSat = saoBaoSat.includes(son);

      // --- Phân tích nhu cầu Sơn / Thủy cho từng hướng ---
      if (isSonVuong && isHuongVuong) {
        // Cả Sơn và Hướng đều sinh vượng (Đồng cung vượng)
        requirementType = 'double';
        reqBadge = { text: '⛰️🌊 CẦN SƠN PHÍA XA + THỦY GẦN', type: 'special' };
        priorityText = 'Tối quan trọng (Song Tinh Đáo Hướng/Tọa)';
        idealLandscape = `Phía trước cần có khoảng sân rộng/đường lộ (Minh đường - Thủy), phía sau hoặc xa hơn có nhà cao tầng/cây lớn che chắn (Sơn).`;
        avoidLandscape = `Tránh địa hình dốc đứng hoặc hoàn toàn trơ trọi không có điểm tựa.`;
        explanation = `Phương vị hội tụ cả <strong>Sơn tinh (${son})</strong> và <strong>Hướng tinh (${huong})</strong> sinh vượng. Vừa cần Thủy để kích tài lộc, vừa cần Sơn để giữ nhân đinh.`;
        score = 95;
        needMountain.push({ dir, name, son, huong, desc: `Có Sơn phía xa để thu nạp Sơn tinh vượng (${son})` });
        needWater.push({ dir, name, son, huong, desc: `Có Thủy phía gần để phát huy Hướng tinh vượng (${huong})` });
      } else if (isHuongVuong) {
        // Hướng tinh sinh vượng -> CẦN THỦY
        requirementType = 'water';
        reqBadge = { text: '🌊 CẦN THỦY (Đường/Nước/Sân Rộng)', type: 'water' };
        priorityText = huong === saoVuongKhi ? 'Ưu tiên số 1 về Tài Lộc' : 'Ưu tiên số 2 về Tài Lộc';
        idealLandscape = `Cần có <strong>ngã ba, ngã tư, đại lộ rộng, ao hồ, hồ bơi, sông suối</strong> hoặc khoảng sân trống phẳng (Minh Đường) nhiều người qua lại để động khí.`;
        avoidLandscape = `Tuyệt đối tránh có <strong>tòa nhà cao tầng sát vách chắn kín, gò đất cao che khuất</strong> (Phạm thế <em>"Hạ Thủy"</em> khiến tài lộc bế tắc, làm ăn thua lỗ).`;
        explanation = `Hướng tinh <strong>${huong === saoVuongKhi ? 'Vượng Khí' : 'Sinh Khí'} (${huong})</strong> đắc vị khi gặp Thủy thực tế (<em>"Thủy quản tài lộc"</em>). Giúp gia chủ đại phát kinh doanh, tiền tài thịnh vượng.`;
        score = 95;
        needWater.push({ dir, name, son, huong, desc: `Nạp Hướng tinh ${huong === saoVuongKhi ? 'Vượng Khí' : 'Sinh Khí'} (${huong}) đón đại tài` });
      } else if (isSonVuong) {
        // Sơn tinh sinh vượng -> CẦN SƠN
        requirementType = 'mountain';
        reqBadge = { text: '⛰️ CẦN SƠN (Nhà Cao/Núi/Cây Lớn)', type: 'mountain' };
        priorityText = son === saoVuongKhi ? 'Ưu tiên số 1 về Nhân Đinh & Sức Khỏe' : 'Ưu tiên số 2 về Nhân Đinh';
        idealLandscape = `Cần có <strong>tòa nhà cao tầng, dãy nhà vững chãi, gò đất cao, hàng cây cổ thụ lớn</strong> hoặc bờ tường kiên cố làm điểm tựa tĩnh lặng.`;
        avoidLandscape = `Tuyệt đối tránh có <strong>ao hồ lớn, mương nước, đường lộ trũng, vùng đất trũng thấp</strong> (Phạm thế <em>"Thượng Sơn"</em> làm tổn hại nhân đinh, sức khỏe suy giảm, gia đạo bất an).`;
        explanation = `Sơn tinh <strong>${son === saoVuongKhi ? 'Vượng Khí' : 'Sinh Khí'} (${son})</strong> đắc vị khi gặp Sơn thực tế (<em>"Sơn quản nhân đinh"</em>). Giúp gia đạo hòa thuận, con cái hiếu thuận, quý nhân tương trợ.`;
        score = 95;
        needMountain.push({ dir, name, son, huong, desc: `Tọa Sơn tinh ${son === saoVuongKhi ? 'Vượng Khí' : 'Sinh Khí'} (${son}) bảo vệ nhân đinh` });
      } else if (isHuongSat) {
        // Hướng tinh là sát tinh (2, 5) -> CẦN TĨNH / CẦN SƠN
        requirementType = 'quiet';
        reqBadge = { text: '🛡️ CẦN TĨNH (Tránh Động Khí / Tránh Đường Đâm)', type: 'danger' };
        priorityText = 'Cảnh báo Sát Khí';
        idealLandscape = `Phía ngoài nên là không gian <strong>yên tĩnh, cây xanh nhỏ thanh bình</strong> hoặc có tường bao che chắn nhẹ nhàng.`;
        avoidLandscape = `Đại kỵ có <strong>ngã ba đường xung, đường đâm thẳng, chợ búa ồn ào, ao tù nước bẩn</strong> vì động khí sẽ kích hoạt sát tinh ${huong === 2 ? 'Nhị Hắc Bệnh Phù' : 'Ngũ Hoàng Đại Sát'} phát tác tai họa.`;
        explanation = `Hướng tinh phạm sát tinh <strong>(${huong})</strong>. Cần giữ phương vị này thật tĩnh để hung tinh không có cơ hội phát tán sát khí.`;
        score = 30;
        needQuiet.push({ dir, name, son, huong, desc: `Tránh động khí để không kích hoạt sát tinh (${huong})` });
      } else {
        // Bình hòa / Thoái khí
        requirementType = 'balance';
        reqBadge = { text: '⚖️ CẦN BÌNH HÒA (Đất Bằng / Nhà Thấp)', type: 'neutral' };
        priorityText = 'Bình thường';
        idealLandscape = `Địa hình bằng phẳng, nhà cửa phố xá thấp tầng thông thường, cây cối xanh mát vừa phải.`;
        avoidLandscape = `Tránh các thế sát nhọn, cột điện, hố rác ô uế.`;
        explanation = `Sơn tinh (${son}) và Hướng tinh (${huong}) thuộc khí bình hòa hoặc thoái khí. Giữ cảnh quan sạch sẽ, thoáng đãng tự nhiên là tốt nhất.`;
        score = 60;
      }

      // Kiểm tra Thất Tinh Đả Kiếp
      const isDaKiep = chartResult.thatTinhDaKiep && chartResult.thatTinhDaKiep.hasThatTinhDaKiep &&
        chartResult.thatTinhDaKiep.linkedPalaces && chartResult.thatTinhDaKiep.linkedPalaces.some(lp => lp.palace === p);
      if (isDaKiep) {
        explanation += ` <span class="rule-good-inline">⭐ Cung thuộc Tam Giác Khí Thất Tinh Đả Kiếp: Ngoại cục cần thoáng đãng, có đường đi hoặc minh đường lưu thông để mượn vượng khí 3 nguyên!</span>`;
      }

      // Kiểm tra Lệnh Tinh Nhập Tù tại cung Hướng
      const isFacing = (chartResult.facingMountain && chartResult.facingMountain.palace === p);
      if (isFacing && chartResult.isHuongTinhNhapTu) {
        explanation += ` <span class="rule-warn-inline">💡 Đầu hướng cần đặc biệt có Thủy (Minh đường rộng, hồ nước, giao lộ lớn) để thực hiện "Giải Tù Quyết" giải cứu vượng khí.</span>`;
      }

      palaceDirections.push({
        palace: p, name, dir, son, huong, van,
        requirementType, reqBadge, priorityText,
        idealLandscape, avoidLandscape, explanation, score
      });
    }

    // 2. Danh sách 6 Đại Hình Sát Ngoại Cục
    const exteriorShaList = [
      {
        id: 'phan-cung',
        name: 'Đường Phản Cung (Kiếm Khí Sát / Phản Cung Sát)',
        icon: '🗡️',
        level: 'Đại Hung',
        badgeType: 'danger',
        desc: 'Con đường hoặc dòng sông uốn lượn hình cánh cung, nhưng phần lưng cong (bụng cung) quay ngược chĩa trực diện vào mặt tiền, cửa chính nhà.',
        effect: 'Tạo luồng khí cắt xé dữ dội như lưỡi kiếm chém vào nhà. Gây hao tài tốn của nặng nề, tai nạn bất ngờ, gia đạo bất an.',
        remedy: '1. Xây tường rào hoặc bình phong chắn khí trước cửa.<br>2. Trồng hàng cây xanh dày đặc hình cánh cung thuận để cản luồng sát khí.<br>3. Treo <strong>Gương Bát Quái Lồi</strong> hoặc đặt cặp <strong>Tỳ Hưu đá / Sư Tử đá</strong> hướng ra phía lưng đường cong.'
      },
      {
        id: 'lo-xung',
        name: 'Lộ Xung Sát (Thương Sát / Đường Đâm Thẳng)',
        icon: '🛣️',
        level: 'Rất Hung',
        badgeType: 'danger',
        desc: 'Một con đường thẳng tắp hoặc ngõ hẻm đâm thẳng trực diện vào cửa chính, cửa hông hoặc ban công của ngôi nhà.',
        effect: 'Luồng xe cộ và gió phóng thẳng như ngọn thương đâm tới. Dễ xảy ra tai nạn giao thông, kiện tụng thị phi, bệnh tật phát tác nhanh (nhất là khi đâm vào cung có sao 2, 5, 3).',
        remedy: '1. Đổi vị trí cửa chính lệch sang bên cạnh, mở cửa phụ thay thế.<br>2. Xây tường hoa, bình phong hoặc hòn non bộ che chắn dòng khí trực xung.<br>3. Đặt cặp <strong>Tỳ Hưu đá / Thạch Cảm Đương</strong> trước cổng.<br>4. Treo <strong>Gương Bát Quái Lồi</strong> trên khung cửa.'
      },
      {
        id: 'thien-tram',
        name: 'Thiên Trảm Sát (Sát Khí Khe Gió Giữa 2 Nhà Cao)',
        icon: '🏢',
        level: 'Rất Hung',
        badgeType: 'danger',
        desc: 'Phía trước mặt nhà đối diện trực tiếp với một khe hở hẹp giữa hai tòa nhà cao tầng.',
        effect: 'Khe hẹp tạo hiệu ứng ống hút gió giật cực mạnh (Trảm phong sát) chém thẳng vào nhà, làm phân tán hoàn toàn sinh khí, gia chủ dễ ốm đau, phẫu thuật, tài vận tiêu tán.',
        remedy: '1. Trồng cây cảnh có tán dày và cao trước ban công/cửa sổ để phân tán luồng gió.<br>2. Treo <strong>Chuông gió đồng 6 ống</strong> hoặc <strong>Gương Bát Quái Lồi</strong> để phản xạ sát khí.<br>3. Luôn buông rèm cửa dày ở các cửa sổ đối diện khe gió.'
      },
      {
        id: 'hoa-diem',
        name: 'Hỏa Diệm Sát (Cột Điện Cao Thế / Trạm Biến Áp / Ống Khói)',
        icon: '⚡',
        level: 'Hung Sát',
        badgeType: 'danger',
        desc: 'Cột điện cao thế, trạm biến áp, tháp viễn thông hoặc ống khói lớn đặt gần và chĩa thẳng vào cửa chính hoặc cửa sổ phòng ngủ.',
        effect: 'Tập trung Hỏa khí và sóng điện từ trường cực mạnh. Đặc biệt nguy hại nếu nằm ở hướng Tây Bắc (Cung Càn) khiến chủ nhà đau đầu, cao huyết áp, bệnh phổi, tính khí nóng nảy.',
        remedy: '1. Đặt <strong>Hồ lô đồng</strong> hoặc <strong>Quả cầu Thạch Anh vàng/nâu (hành Thổ)</strong> ở bậu cửa để Thổ tiết chế Hỏa.<br>2. Dán phim cách nhiệt, lắp rèm cửa màu xanh biển hoặc trắng (Kim/Thủy).<br>3. Đặt cây xanh thủy sinh để làm dịu bức xạ nhiệt.'
      },
      {
        id: 'dao-dinh',
        name: 'Đao Đình Sát / Giác Sát (Góc Nhọn Nhà Đối Diện Chĩa Vào)',
        icon: '🪟',
        level: 'Hung',
        badgeType: 'warning',
        desc: 'Góc nhọn của mái nhà, góc tường vuông hoặc cạnh tường của nhà hàng xóm đâm thẳng vào cửa chính, ban công hoặc cửa sổ.',
        effect: 'Tạo cảm giác bị áp lực đe dọa liên tục, gây căng thẳng thần kinh, thị phi tranh chấp và tổn thương thể chất.',
        remedy: '1. Đặt chậu cây cảnh có tán lá dày xanh tốt trước góc nhọn để hóa giải tầm nhìn.<br>2. Treo <strong>Gương Bát Quái Lồi</strong> hoặc rèm sáo gỗ tại cửa sổ hướng về góc nhọn.<br>3. Đặt quả cầu đá thạch anh trắng trên bậu cửa.'
      },
      {
        id: 'long-ho-khuyet',
        name: 'Long Hổ Khuyết (Thế Đất Trơ Trọi / Thiếu Che Chắn Tả Hữu)',
        icon: '🛡️',
        level: 'Tán Khí',
        badgeType: 'warning',
        desc: 'Ngôi nhà xây trơ trọi một mình giữa khu đất trống, hai bên trái (Thanh Long) và phải (Bạch Hổ) trống hoác không có nhà cửa hay gò đất che chắn.',
        effect: 'Phạm câu <em>"Sinh khí tán ư phiêu phong"</em>. Gió bốn phương thổi thốc qua làm phân tán toàn bộ sinh khí, gia đình khó tích lũy tiền của, người trong nhà thường đơn độc phiêu bạt.',
        remedy: '1. Xây tường rào kiên cố bao bọc xung quanh nhà.<br>2. Trồng các hàng cây xanh cao hai bên hông nhà để tạo thế Long Hổ nhân tạo che chắn gió.<br>3. Phía trước tạo khoảng sân có bồn hoa/hồ nước nhỏ để giữ khí.'
      }
    ];

    return {
      meta: {
        vanTrach,
        saoVuongKhi,
        saoSinhKhi_1,
        saoBaoSat,
        facingDegree
      },
      palaceDirections,
      needMountain,
      needWater,
      needQuiet,
      exteriorShaList
    };
  }

  /**
   * Tạo HTML hiển thị toàn bộ phần luận giải Loan Đầu Ngoại Cục
   * @param {Object} analysis - Kết quả từ analyzeLoanDau()
   * @returns {string} HTML string
   */
  function renderLoanDauHTML(analysis) {
    if (!analysis) return '';

    const meta = analysis.meta;
    const v = meta.vanTrach;
    const sVuong = meta.saoVuongKhi;
    const sSinh = meta.saoSinhKhi_1;

    return `
      <div class="loan-dau-container">
        <!-- Header -->
        <div class="loan-dau-header">
          <div class="loan-dau-title-group">
            <span class="loan-dau-tag">Loan Đầu Ngoại Cục</span>
            <h3 class="loan-dau-main-title">⛰️🌊 Luận Giải & Gợi Ý Loan Đầu Ngoại Cục</h3>
            <p class="loan-dau-subtitle"><em>"Loan đầu vô lý khí bất chuẩn, lý khí vô loan đầu bất nghiệm"</em> – Hướng dẫn phối hợp hình thế Sơn - Thủy môi trường bên ngoài theo Tinh Bàn Vận ${v}</p>
          </div>
        </div>

        <!-- Khung Nguyên Lý Thu Sơn Xuất Sát -->
        <div class="loan-dau-principle-box">
          <div class="principle-item p-mountain">
            <span class="p-icon">⛰️</span>
            <div class="p-text">
              <strong>Thu Sơn (Vượng Nhân Đinh - Sức Khỏe):</strong> Cung có <strong>Sơn Tinh ${sVuong} (${sSinh})</strong> cần gặp <strong>SƠN thực tế</strong> (Nhà cao tầng, gò đất, cây lớn, bờ tường vững) để bảo vệ sức khỏe và gia đạo. Kỵ gặp ao hồ, đường trũng (phạm <em>Thượng Sơn</em>).
            </div>
          </div>
          <div class="principle-item p-water">
            <span class="p-icon">🌊</span>
            <div class="p-text">
              <strong>Xuất Sát (Vượng Tài Lộc - Kinh Doanh):</strong> Cung có <strong>Hướng Tinh ${sVuong} (${sSinh})</strong> cần gặp <strong>THỦY thực tế</strong> (Đường lộ lớn, ngã ba, ao hồ, sân phẳng) để kích hoạt tài lộc. Kỵ nhà cao áp sát chắn kín (phạm <em>Hạ Thủy</em>).
            </div>
          </div>
          <div class="principle-item p-quiet">
            <span class="p-icon">🛡️</span>
            <div class="p-text">
              <strong>Trấn Sát (Tránh Kích Hoạt Hung Tinh):</strong> Cung có <strong>Hướng Tinh 2 & 5</strong> cần giữ <strong>TĨNH LẶNG</strong>, tránh xa ngã ba đường xung hoặc ao tù nước bẩn để không đánh thức sát khí.
            </div>
          </div>
        </div>

        <!-- Tabs Chuyển Đổi Loan Đầu -->
        <div class="loan-dau-tabs-container">
          <div class="loan-dau-tabs-scroll">
            <button type="button" class="loan-dau-tab active" data-tab="ld-8dir">🗺️ Gợi Ý Sơn - Thủy 8 Phương Vị</button>
            <button type="button" class="loan-dau-tab" data-tab="ld-summary">⚖️ Phân Bổ Sơn - Thủy Toàn Cục</button>
            <button type="button" class="loan-dau-tab" data-tab="ld-sha">⚠️ Cẩm Nang Hóa Giải 6 Đại Hình Sát</button>
          </div>
        </div>

        <!-- TAB 1: 8 Phương Vị Chi Tiết -->
        <div class="loan-dau-tab-panel active" id="tab-ld-8dir">
          <div class="loan-dau-cards-grid">
            ${analysis.palaceDirections.map(item => renderDirectionCard(item, v)).join('')}
          </div>
        </div>

        <!-- TAB 2: Phân Bổ Sơn - Thủy Toàn Cục -->
        <div class="loan-dau-tab-panel" id="tab-ld-summary">
          <div class="loan-dau-summary-grid">
            <!-- Cột 1: Cần Sơn -->
            <div class="summary-col col-mountain">
              <div class="summary-col-header">
                <span class="col-icon">⛰️</span>
                <h4>Các Phương Vị Ngoài Nhà CẦN CÓ SƠN (Nhà Cao / Điểm Tựa)</h4>
              </div>
              <p class="summary-col-desc">Nơi có Sơn tinh sinh vượng (${sVuong}, ${sSinh}), cần nhà cao tầng, gò đồi hoặc bờ tường để vượng nhân đinh và sức khỏe:</p>
              <div class="summary-items-list">
                ${analysis.needMountain.length > 0 ? 
                  analysis.needMountain.map(m => `
                    <div class="summary-item-card">
                      <strong class="sum-dir">${m.dir} (${m.name})</strong>
                      <span class="sum-stars">[Sơn: ${m.son} - Hướng: ${m.huong}]</span>
                      <p class="sum-tip">${m.desc}</p>
                    </div>
                  `).join('') : '<p class="empty-tip">Cần giữ các hướng tựa lưng sạch sẽ và vững chãi.</p>'
                }
              </div>
            </div>

            <!-- Cột 2: Cần Thủy -->
            <div class="summary-col col-water">
              <div class="summary-col-header">
                <span class="col-icon">🌊</span>
                <h4>Các Phương Vị Ngoài Nhà CẦN CÓ THỦY (Đường Lớn / Thoáng Đãng)</h4>
              </div>
              <p class="summary-col-desc">Nơi có Hướng tinh sinh vượng (${sVuong}, ${sSinh}), cần đường lộ rộng, ngã ba, hồ nước hoặc khoảng sân trống để đón đại tài lộc:</p>
              <div class="summary-items-list">
                ${analysis.needWater.length > 0 ? 
                  analysis.needWater.map(w => `
                    <div class="summary-item-card">
                      <strong class="sum-dir">${w.dir} (${w.name})</strong>
                      <span class="sum-stars">[Sơn: ${w.son} - Hướng: ${w.huong}]</span>
                      <p class="sum-tip">${w.desc}</p>
                    </div>
                  `).join('') : '<p class="empty-tip">Cần giữ các hướng cửa nạp khí luôn thông thoáng sáng sủa.</p>'
                }
              </div>
            </div>
          </div>

          ${analysis.needQuiet.length > 0 ? `
            <div class="summary-quiet-box">
              <div class="quiet-header">
                <span>🛡️</span>
                <strong>LƯU Ý CÁC HƯỚNG CẦN GIỮ TĨNH (TRÁNH ĐỘNG KHÍ / TRÁNH ĐƯỜNG ĐÂM):</strong>
              </div>
              <div class="quiet-tags">
                ${analysis.needQuiet.map(q => `<span class="quiet-pill">⚠️ Hướng ${q.dir} (${q.name}) [Hướng Tinh: ${q.huong}]: ${q.desc}</span>`).join('')}
              </div>
            </div>
          ` : ''}
        </div>

        <!-- TAB 3: 6 Đại Hình Sát & Hóa Giải -->
        <div class="loan-dau-tab-panel" id="tab-ld-sha">
          <div class="loan-dau-sha-tip">
            💡 <strong>Lưu ý từ chuyên gia phong thủy:</strong> <em>"Hình sát ngoại cục trực diện có sức phá hoại nhanh và mạnh hơn lý khí."</em> Nếu ngôi nhà của bạn đối diện với một trong các hình sát dưới đây, hãy áp dụng ngay phương pháp hóa giải tương ứng để bảo vệ bình an cho gia đình.
          </div>

          <div class="loan-dau-sha-grid">
            ${analysis.exteriorShaList.map(sha => renderShaCard(sha)).join('')}
          </div>
        </div>
      </div>
    `;
  }

  function renderDirectionCard(item, vanTrach) {
    let cardTheme = 'theme-neutral';
    if (item.requirementType === 'mountain') cardTheme = 'theme-mountain';
    if (item.requirementType === 'water') cardTheme = 'theme-water';
    if (item.requirementType === 'quiet') cardTheme = 'theme-quiet';
    if (item.requirementType === 'special') cardTheme = 'theme-special';

    return `
      <div class="loan-dau-card ${cardTheme}">
        <div class="ld-card-top">
          <div class="ld-loc-info">
            <strong class="ld-dir-name">${item.dir}</strong>
            <span class="ld-pal-name">(${item.name})</span>
          </div>
          <div class="ld-stars-badge">
            <span class="ld-star-s" title="Sơn Tinh">Sơn: ${item.son}</span>
            <span class="ld-star-h" title="Hướng Tinh">Hướng: ${item.huong}</span>
          </div>
        </div>

        <div class="ld-req-badge-row">
          <span class="ld-badge ${item.reqBadge.type}">${item.reqBadge.text}</span>
        </div>

        <div class="ld-card-body">
          <div class="ld-section ideal">
            <span class="ld-sec-label">✅ Ngoại cảnh lý tưởng:</span>
            <p class="ld-sec-text">${item.idealLandscape}</p>
          </div>

          <div class="ld-section avoid">
            <span class="ld-sec-label">🚫 Đại kỵ ngoại cảnh:</span>
            <p class="ld-sec-text">${item.avoidLandscape}</p>
          </div>

          <div class="ld-section explain">
            <span class="ld-sec-label">💡 Luận giải:</span>
            <p class="ld-sec-text">${item.explanation}</p>
          </div>
        </div>
      </div>
    `;
  }

  function renderShaCard(sha) {
    return `
      <div class="sha-card">
        <div class="sha-card-header">
          <div class="sha-title-row">
            <span class="sha-icon">${sha.icon}</span>
            <h4 class="sha-name">${sha.name}</h4>
          </div>
          <span class="sha-badge ${sha.badgeType}">${sha.level}</span>
        </div>

        <div class="sha-card-body">
          <div class="sha-desc-box">
            <strong>👁️ Nhận diện:</strong> ${sha.desc}
          </div>
          <div class="sha-effect-box">
            <strong>⚠️ Tác hại:</strong> ${sha.effect}
          </div>
          <div class="sha-remedy-box">
            <strong>🛠️ Phương pháp hóa giải triệt để:</strong>
            <div class="remedy-steps">${sha.remedy}</div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Khởi tạo và gắn sự kiện chuyển tab cho phần Loan Đầu
   */
  function initLoanDauTabs() {
    const tabButtons = document.querySelectorAll('.loan-dau-tab');
    const tabPanels = document.querySelectorAll('.loan-dau-tab-panel');

    tabButtons.forEach(btn => {
      btn.addEventListener('click', function() {
        const targetId = this.dataset.tab;
        
        tabButtons.forEach(b => b.classList.remove('active'));
        tabPanels.forEach(p => p.classList.remove('active'));

        this.classList.add('active');
        const targetPanel = document.getElementById('tab-' + targetId);
        if (targetPanel) {
          targetPanel.classList.add('active');
        }
      });
    });
  }

  // Xuất module ra phạm vi toàn cục
  window.LoanDauRules = {
    analyze: analyzeLoanDau,
    renderHTML: renderLoanDauHTML,
    initTabs: initLoanDauTabs
  };

})();
