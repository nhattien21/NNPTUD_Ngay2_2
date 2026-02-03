const API_URL = "http://localhost:3000/posts";

// 1. Hàm lấy và hiển thị danh sách
async function fetchPosts() {
    try {
        const response = await fetch(API_URL);
        const posts = await response.json();
        renderPosts(posts);
    } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error);
    }
}

// 2. Hàm hiển thị ra giao diện
function renderPosts(posts) {
    const listElement = document.getElementById('post-list');
    listElement.innerHTML = ''; // Xóa nội dung cũ

    posts.forEach(post => {
        const li = document.createElement('li');
        
        // YÊU CẦU: Kiểm tra nếu đã xóa mềm thì thêm class gạch ngang
        if (post.isDeleted) {
            li.classList.add('deleted-post');
        }

        li.innerHTML = `
            <span><strong>ID: ${post.id}</strong> - ${post.title} (${post.views} views)</span>
            ${!post.isDeleted ? `<button class="btn-delete" onclick="softDeletePost('${post.id}')">Xóa</button>` : '<span>(Đã xóa)</span>'}
        `;
        listElement.appendChild(li);
    });
}

// 3. YÊU CẦU: Hàm tạo mới với ID tự tăng (MaxId + 1)
async function createPost() {
    const titleInput = document.getElementById('title');
    const viewsInput = document.getElementById('views');
    
    if (!titleInput.value) return alert("Vui lòng nhập tiêu đề");

    // Bước 1: Lấy danh sách hiện tại để tìm Max ID
    const response = await fetch(API_URL);
    const posts = await response.json();

    // Tìm ID lớn nhất
    const currentIds = posts.map(p => parseInt(p.id)); // Chuyển ID sang số
    const maxId = currentIds.length > 0 ? Math.max(...currentIds) : 0;
    
    // Tạo ID mới
    const newId = (maxId + 1).toString();

    // Bước 2: Tạo object mới
    const newPost = {
        id: newId,
        title: titleInput.value,
        views: parseInt(viewsInput.value) || 0,
        isDeleted: false // Mặc định chưa xóa
    };

    // Bước 3: Gửi lên Server
    await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPost)
    });

    // Reset form và tải lại
    titleInput.value = '';
    viewsInput.value = '';
    fetchPosts();
}

// 4. YÊU CẦU: Xóa mềm (Chuyển isDeleted: true)
async function softDeletePost(id) {
    if (!confirm("Bạn có chắc muốn xóa bài này không?")) return;

    // Dùng PATCH để chỉ cập nhật trường isDeleted thay vì xóa hẳn (DELETE)
    await fetch(`${API_URL}/${id}`, {
        method: 'PATCH', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            isDeleted: true
        })
    });

    fetchPosts();
}

// Khởi chạy
fetchPosts();