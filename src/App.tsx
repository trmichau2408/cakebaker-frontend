import { useEffect, useRef, useState, type FormEvent } from "react";

type RecipeType = "cake" | "cookie" | "flan";
type Recipe = {
  id: string;
  type: RecipeType;
  emoji: string;
  label: string;
  name: string;
  description: string;
  time: string;
  level: string;
  servings: string;
  ingredients: string[];
  steps: string[];
};

const recipes: Recipe[] = [
  {
    id: "sponge", type: "cake", emoji: "🍰", label: "Mềm xốp", name: "Bánh bông lan sữa chua",
    description: "Cốt bánh mềm nhẹ, thơm dịu; hợp cho lần đầu làm bánh tại nhà.", time: "50 phút", level: "Dễ", servings: "6 phần",
    ingredients: ["2 quả trứng gà", "100 g sữa chua không đường", "100 g bột mì đa dụng", "70 g đường", "35 ml dầu ăn", "1 thìa cà phê bột nở"],
    steps: ["Làm nóng lò ở 170°C. Lót giấy nến vào khuôn tròn khoảng 16 cm.", "Đánh trứng với đường đến khi hỗn hợp sáng màu và hơi bông. Trộn sữa chua cùng dầu ăn.", "Rây bột mì và bột nở vào hỗn hợp, trộn nhẹ tay đến khi vừa hòa quyện.", "Đổ bột vào khuôn, nướng khoảng 30–35 phút. Xiên tăm vào giữa bánh; nếu tăm khô, bánh đã chín.", "Để bánh nguội bớt trước khi lấy khỏi khuôn. Lò mỗi nhà khác nhau nên kiểm tra từ phút thứ 28."],
  },
  {
    id: "cookies", type: "cookie", emoji: "🍪", label: "Giòn thơm", name: "Bánh quy bơ chocolate",
    description: "Mẻ bánh nhỏ thơm mùi bơ, viền giòn nhẹ và có chocolate trong từng miếng.", time: "35 phút", level: "Dễ", servings: "12 chiếc",
    ingredients: ["100 g bơ lạt mềm", "70 g đường nâu", "1 quả trứng nhỏ", "160 g bột mì đa dụng", "1/2 thìa cà phê bột nở", "70 g chocolate chip"],
    steps: ["Làm nóng lò ở 170°C và lót giấy nến lên khay.", "Đánh bơ với đường cho hòa quyện, thêm trứng rồi trộn đều.", "Rây bột mì và bột nở vào âu, trộn vừa đủ. Cho chocolate chip vào sau cùng.", "Chia bột thành 12 viên, đặt cách nhau trên khay và ấn dẹt nhẹ.", "Nướng khoảng 12–15 phút đến khi rìa bánh vàng. Để nguội trên khay vài phút trước khi chuyển ra rack."],
  },
  {
    id: "flan", type: "flan", emoji: "🍮", label: "Mát lạnh", name: "Bánh flan caramel",
    description: "Món tráng miệng béo mịn, thơm caramel và không cần lò nướng.", time: "60 phút", level: "Vừa", servings: "5 hũ",
    ingredients: ["3 quả trứng gà", "2 lòng đỏ trứng", "400 ml sữa tươi không đường", "70 g đường cho phần flan", "60 g đường làm caramel", "1 thìa cà phê nước cốt chanh"],
    steps: ["Đun 60 g đường với một ít nước đến màu hổ phách, thêm nước cốt chanh rồi chia vào đáy khuôn.", "Hâm ấm sữa với 70 g đường, khuấy tan; không đun sôi.", "Khuấy nhẹ trứng và lòng đỏ, từ từ rót sữa ấm vào. Lọc hỗn hợp qua rây.", "Rót flan vào khuôn. Hấp cách thủy lửa nhỏ khoảng 25–30 phút, phủ khăn dưới nắp nồi để nước không nhỏ vào mặt bánh.", "Để nguội rồi làm lạnh ít nhất 3 giờ. Hấp lửa nhỏ giúp mặt bánh mịn hơn."],
  },
];

const filterOptions: { id: "all" | RecipeType; label: string }[] = [
  { id: "all", label: "Tất cả" },
  { id: "cake", label: "Bánh bông lan" },
  { id: "cookie", label: "Bánh quy" },
  { id: "flan", label: "Bánh lạnh" },
];

function getToday() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function App() {
  const [activeFilter, setActiveFilter] = useState<"all" | RecipeType>("all");
  const [query, setQuery] = useState("");
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [toast, setToast] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const toastTimer = useRef<number | undefined>(undefined);
  const confirmationRef = useRef<HTMLParagraphElement>(null);

  const visibleRecipes = recipes.filter((recipe) =>
    (activeFilter === "all" || recipe.type === activeFilter)
    && `${recipe.name} ${recipe.description} ${recipe.label}`.toLocaleLowerCase("vi").includes(query.trim().toLocaleLowerCase("vi")),
  );

  useEffect(() => {
    if (!selectedRecipe) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedRecipe(null);
    };
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedRecipe]);

  useEffect(() => () => window.clearTimeout(toastTimer.current), []);

  function showToast(message: string) {
    setToast(message);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(""), 2600);
  }

  async function share(title: string, id: string) {
    const shareData = {
      title: `${title} — Bếp Mơ`,
      text: `Cùng thử ${title} nhé!`,
      url: `${window.location.href.split("#")[0]}#${id}`,
    };
    try {
      if (navigator.share) await navigator.share(shareData);
      else if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
        showToast("Đã sao chép nội dung chia sẻ!");
      } else showToast("Hãy sao chép địa chỉ trang để chia sẻ nhé!");
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") showToast("Chưa thể chia sẻ lúc này. Bạn thử lại nhé!");
    }
  }

  function handleOrderSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const phoneInput = form.elements.namedItem("phone") as HTMLInputElement;
    const normalizedPhone = phoneInput.value.replace(/[\s().-]/g, "");
    const vietnamPhone = /^(?:\+?84|0)(?:3|5|7|8|9)\d{8}$/;
    if (!vietnamPhone.test(normalizedPhone)) {
      phoneInput.setCustomValidity("Vui lòng nhập số điện thoại Việt Nam hợp lệ.");
      phoneInput.reportValidity();
      return;
    }
    phoneInput.setCustomValidity("");
    setConfirmation("Thông tin đã được kiểm tra trong bản demo này, nhưng chưa được gửi hoặc lưu. Vui lòng liên hệ trực tiếp Bếp Mơ để xác nhận đơn bánh thật.");
    window.setTimeout(() => confirmationRef.current?.focus(), 0);
  }

  return (
    <>
      <header className="topbar">
        <nav className="nav wrap" aria-label="Điều hướng chính">
          <a className="brand" href="#home" aria-label="Bếp Mơ, về đầu trang"><span className="brand-mark" aria-hidden="true">🥣</span><span>Bếp Mơ</span></a>
          <div className="nav-links">
            <a href="#recipes">Công thức</a>
            <a href="#start">Bắt đầu thế nào?</a>
            <a href="#community">Cộng đồng</a>
            <a className="contact-link" href="#contact">Liên hệ</a>
          </div>
          <a className="nav-cta" href="#recipes">Chọn bánh để làm <span aria-hidden="true">↗</span></a>
        </nav>
      </header>

      <main>
        <section className="hero" id="home">
          <div className="hero-grid wrap">
            <div>
              <span className="eyebrow"><span aria-hidden="true">✿</span> Bếp nhỏ, niềm vui to</span>
              <h1>Mẻ bánh đầu tiên<br />có thể <em>rất ngọt ngào.</em></h1>
              <p className="hero-copy">Học làm bánh tại nhà qua những công thức dễ hiểu, từng bước rõ ràng và mẹo nhỏ giúp bạn tự tin hơn sau mỗi lần bật lò.</p>
              <div className="hero-actions">
                <a className="button-primary" href="#recipes">Khám phá công thức <span aria-hidden="true">→</span></a>
                <a className="button-secondary" href="#start">Mình mới bắt đầu</a>
              </div>
              <div className="social-proof">
                <div className="avatar-stack" aria-hidden="true"><span className="avatar">👩🏻‍🍳</span><span className="avatar">🧁</span><span className="avatar">🍓</span></div>
                <span>Cùng nhau học, cùng nhau chia sẻ niềm vui làm bánh</span>
              </div>
            </div>
            <div className="hero-art" aria-label="Minh họa chiếc bánh kem dâu tự làm">
              <div className="art-orbit" /><div className="cake-plate"><div className="cake" /></div>
              <div className="art-tag tag-one"><span aria-hidden="true">⏱</span> Công thức dễ làm</div>
              <div className="art-tag tag-two"><span aria-hidden="true">♡</span> Làm bằng cả yêu thương</div>
            </div>
          </div>
        </section>

        <section className="section section-white" id="recipes">
          <div className="wrap">
            <div className="section-head">
              <div><p className="section-kicker">Góc công thức</p><h2>Hôm nay mình làm bánh gì?</h2><p className="section-desc">Chọn một công thức vừa sức, chuẩn bị nguyên liệu và bắt đầu từ những bước nhỏ nhất.</p></div>
              <label className="search-box"><span aria-hidden="true">⌕</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm món bánh..." aria-label="Tìm công thức làm bánh" /></label>
            </div>
            <div className="filters" role="group" aria-label="Lọc công thức theo loại bánh">
              {filterOptions.map((filter) => <button key={filter.id} className={`filter ${activeFilter === filter.id ? "active" : ""}`} data-filter={filter.id} aria-pressed={activeFilter === filter.id} onClick={() => setActiveFilter(filter.id)}>{filter.label}</button>)}
            </div>
            <div className="recipe-grid" aria-live="polite">
              {visibleRecipes.length ? visibleRecipes.map((recipe) => (
                <article className="recipe-card" key={recipe.id}>
                  <div className="recipe-visual" aria-hidden="true"><span className="food-emoji">{recipe.emoji}</span><span className="food-label">{recipe.label}</span></div>
                  <div className="recipe-body">
                    <div className="recipe-meta"><span>⏱ {recipe.time}</span><span>{recipe.servings}</span></div>
                    <h3>{recipe.name}</h3><p>{recipe.description}</p>
                    <div className="card-bottom"><span className="difficulty">✿ {recipe.level}</span><button className="text-button" type="button" onClick={() => setSelectedRecipe(recipe)}>Xem công thức →</button></div>
                  </div>
                </article>
              )) : <div className="empty-state">Chưa tìm thấy công thức phù hợp. Thử một tên bánh khác nhé!</div>}
            </div>
          </div>
        </section>

        <section className="section" id="start">
          <div className="wrap">
            <div className="section-head"><div><p className="section-kicker">Bắt đầu thật nhẹ nhàng</p><h2>Ba bước để căn bếp thơm lừng</h2><p className="section-desc">Không cần thật khéo ngay từ đầu. Chỉ cần làm theo từng bước và tận hưởng hành trình của mình.</p></div></div>
            <div className="steps-grid">
              <article className="step-card"><div className="step-number">01</div><h3>Chọn công thức hợp sức</h3><p>Bắt đầu với món ít nguyên liệu, thời gian chuẩn bị ngắn và độ khó phù hợp với bạn.</p></article>
              <article className="step-card"><div className="step-number">02</div><h3>Chuẩn bị trước khi trộn</h3><p>Đọc hết hướng dẫn, cân sẵn nguyên liệu và làm nóng lò theo nhiệt độ công thức.</p></article>
              <article className="step-card"><div className="step-number">03</div><h3>Lưu lại mẻ bánh của bạn</h3><p>Chụp ảnh thành quả, ghi chú điều bạn đã học và chia sẻ niềm vui với mọi người.</p></article>
            </div>
          </div>
        </section>

        <section className="section section-white" id="community">
          <div className="wrap"><div className="share-banner">
            <div><p className="section-kicker">Lan tỏa vị ngọt</p><h2>Mẻ bánh của bạn xứng đáng được khoe!</h2><p>Chia sẻ công thức này với người bạn muốn rủ vào bếp.</p></div>
            <button className="button-primary" type="button" onClick={() => void share("Bếp Mơ", "community")}><span aria-hidden="true">↗</span> Chia sẻ Bếp Mơ</button>
          </div></div>
        </section>

        <section className="section" id="contact">
          <div className="wrap">
            <div className="section-head"><div><p className="section-kicker">Bếp Mơ luôn ở đây</p><h2>Liên hệ & đăng ký mua bánh</h2><p className="section-desc">Bạn muốn đặt một mẻ bánh cho dịp đặc biệt? Gửi thông tin để bắt đầu trao đổi với Bếp Mơ.</p></div></div>
            <div className="contact-grid">
              <aside className="contact-card">
                <h3>Ghé thăm Bếp Mơ</h3><p>Các thông tin dưới đây là chỗ trống để chủ tiệm thay bằng kênh liên hệ thật.</p>
                <div className="contact-list">
                  <div className="contact-item"><small>Điện thoại</small><span>[Thêm số điện thoại]</span></div>
                  <div className="contact-item"><small>Email</small><span>[Thêm địa chỉ email]</span></div>
                  <div className="contact-item"><small>Mạng xã hội</small><span>[Thêm liên kết Instagram / TikTok / Facebook]</span></div>
                </div>
              </aside>
              <div className="order-card">
                <h3>Đăng ký mua bánh</h3><p className="order-note">Điền thông tin bên dưới. Bếp Mơ sẽ cần liên hệ trực tiếp để xác nhận đơn và thời gian nhận bánh.</p>
                <form onSubmit={handleOrderSubmit} onChange={() => setConfirmation("")}>
                  <div className="form-grid">
                    <div className="field"><label htmlFor="customer-name">Họ và tên *</label><input id="customer-name" name="name" autoComplete="name" required maxLength={80} placeholder="Tên của bạn" /></div>
                    <div className="field"><label htmlFor="customer-phone">Số điện thoại *</label><input id="customer-phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" required placeholder="Ví dụ: 0912345678" aria-describedby="phone-help" onChange={(event) => event.currentTarget.setCustomValidity("")} /><span className="form-help" id="phone-help">Nhập số Việt Nam, có thể dùng đầu số +84.</span></div>
                    <div className="field"><label htmlFor="cake-choice">Loại bánh *</label><select id="cake-choice" name="cake" required defaultValue=""><option value="" disabled>Chọn một loại bánh</option><option>Bánh bông lan sữa chua</option><option>Bánh quy bơ chocolate</option><option>Bánh flan caramel</option><option>Khác — trao đổi thêm</option></select></div>
                    <div className="field"><label htmlFor="cake-quantity">Số lượng *</label><input id="cake-quantity" name="quantity" type="number" min={1} max={50} step={1} defaultValue={1} required /></div>
                    <div className="field field-full"><label htmlFor="pickup-date">Ngày mong muốn nhận bánh *</label><input id="pickup-date" name="date" type="date" min={getToday()} required /></div>
                    <div className="field field-full"><label htmlFor="order-notes">Ghi chú thêm <span className="form-help">(không bắt buộc)</span></label><textarea id="order-notes" name="notes" maxLength={500} placeholder="Ví dụ: lời nhắn trên bánh, dị ứng nguyên liệu..." /></div>
                  </div>
                  <div className="form-actions"><button className="button-primary" type="submit">Gửi đăng ký <span aria-hidden="true">→</span></button><p className="form-disclaimer">Đây là bản demo: thông tin không được gửi đi hay lưu lại. Đơn bánh chỉ được xác nhận sau khi bạn liên hệ trực tiếp.</p></div>
                  <p className="form-confirmation" ref={confirmationRef} tabIndex={-1} role="status" aria-live="polite" hidden={!confirmation}>{confirmation}</p>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer><div className="footer-inner wrap">
        <a className="brand" href="#home"><span className="brand-mark" aria-hidden="true">🥣</span><span>Bếp Mơ</span></a>
        <span>Được làm bằng một chút bột, một chút đường và thật nhiều yêu thương.</span>
        <div className="footer-social" aria-label="Mạng xã hội (thay bằng liên kết thật khi có)"><span>Instagram</span><span>TikTok</span><span>Facebook</span></div>
      </div></footer>

      {selectedRecipe && <div className="modal-backdrop" onClick={(event) => { if (event.target === event.currentTarget) setSelectedRecipe(null); }}>
        <section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
          <div className="modal-top"><div><p className="section-kicker">Công thức hôm nay</p><h2 id="modal-title">{selectedRecipe.name}</h2></div><button className="modal-close" type="button" aria-label="Đóng hướng dẫn" onClick={() => setSelectedRecipe(null)}>×</button></div>
          <div className="modal-content">
            <p className="modal-intro">{selectedRecipe.description}</p>
            <div className="modal-stats"><span>⏱ {selectedRecipe.time}</span><span>🍽 {selectedRecipe.servings}</span><span>✿ Độ khó: {selectedRecipe.level}</span></div>
            <h3>Nguyên liệu</h3><ul>{selectedRecipe.ingredients.map((item) => <li key={item}>{item}</li>)}</ul>
            <h3>Cách làm</h3><ol>{selectedRecipe.steps.map((item) => <li key={item}>{item}</li>)}</ol>
            <button className="button-primary" type="button" onClick={() => void share(selectedRecipe.name, selectedRecipe.id)}>Chia sẻ công thức ↗</button>
          </div>
        </section>
      </div>}
      <div className={`toast ${toast ? "show" : ""}`} role="status" aria-live="polite">{toast}</div>
    </>
  );
}

export default App;
