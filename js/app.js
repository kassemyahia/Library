const UserManager = {
    getCurrentUser() {
        const userData = localStorage.getItem('currentUser');
        return userData ? JSON.parse(userData) : null;
    },

    saveUser(userData) {
        localStorage.setItem('currentUser', JSON.stringify(userData));
    },

    login(username, password) {
        const userData = {
            username: username,
            name: username,
            email: username + '@example.com',
            phone: '',
            birthDate: '',
            bio: '',
            interests: '',
            avatar: null,
            joinDate: new Date().toISOString(),
            stats: {
                booksRead: 12,
                currentBooks: 3,
                readingHours: 45,
                favoriteCategory: 'البرمجة'
            }
        };
        
        this.saveUser(userData);
        return userData;
    },

    logout() {
        localStorage.removeItem('currentUser');
        window.location.href = 'login.html';
    },

    isLoggedIn() {
        return this.getCurrentUser() !== null;
    },

    updateProfile(profileData) {
        const currentUser = this.getCurrentUser();
        if (currentUser) {
            const updatedUser = { ...currentUser, ...profileData };
            this.saveUser(updatedUser);
            return updatedUser;
        }
        return null;
    }
};

const BookManager = {
    borrowedBooks: [
        {
            id: 1,
            title: 'تعلم البرمجة من الصفر',
            author: 'أحمد محمد',
            category: 'البرمجة',
            cover: 'fas fa-code',
            dueDate: '2024-12-15',
            status: 'borrowed'
        },
        {
            id: 2,
            title: 'فن التصميم الجرافيكي',
            author: 'فاطمة علي',
            category: 'الفنون',
            cover: 'fas fa-palette',
            dueDate: '2024-12-20',
            status: 'borrowed'
        },
        {
            id: 3,
            title: 'مبادئ الفيزياء الحديثة',
            author: 'د. خالد حسن',
            category: 'العلوم',
            cover: 'fas fa-microscope',
            dueDate: '2024-12-25',
            status: 'borrowed'
        }
    ],

    getBorrowedBooks() {
        return this.borrowedBooks;
    },

    renewBook(bookId) {
        const book = this.borrowedBooks.find(b => b.id === bookId);
        if (book) {
            const dueDate = new Date(book.dueDate);
            dueDate.setDate(dueDate.getDate() + 14);
            book.dueDate = dueDate.toISOString().split('T')[0];
            return true;
        }
        return false;
    },

    returnBook(bookId) {
        const bookIndex = this.borrowedBooks.findIndex(b => b.id === bookId);
        if (bookIndex !== -1) {
            this.borrowedBooks.splice(bookIndex, 1);
            return true;
        }
        return false;
    }
};

const CategoryManager = {
    categories: [
        { id: 'all', name: 'جميع الكتب', icon: 'fas fa-book' },
        { id: 'programming', name: 'البرمجة', icon: 'fas fa-code' },
        { id: 'arts', name: 'الفنون', icon: 'fas fa-palette' },
        { id: 'science', name: 'العلوم', icon: 'fas fa-microscope' },
        { id: 'history', name: 'التاريخ', icon: 'fas fa-history' },
        { id: 'literature', name: 'الأدب', icon: 'fas fa-heart' },
        { id: 'economics', name: 'الاقتصاد', icon: 'fas fa-chart-line' },
        { id: 'education', name: 'التعليم', icon: 'fas fa-graduation-cap' }
    ],

    getCategories() {
        return this.categories;
    },

    getCategoryById(id) {
        return this.categories.find(cat => cat.id === id);
    }
};

const UIManager = {
    showAlert(message, type = 'info') {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} animate-fadeIn`;
        alertDiv.innerHTML = `
            <i class="fas fa-${this.getAlertIcon(type)}"></i>
            ${message}
        `;
        
        document.body.insertBefore(alertDiv, document.body.firstChild);
        
        setTimeout(() => {
            alertDiv.remove();
        }, 5000);
    },

    getAlertIcon(type) {
        const icons = {
            success: 'check-circle',
            danger: 'exclamation-triangle',
            warning: 'exclamation-circle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    },

    confirm(message, callback) {
        if (confirm(message)) {
            callback();
        }
    },

    updateBookCount() {
        const bookCount = BookManager.getBorrowedBooks().length;
        const countElement = document.getElementById('bookCount');
        if (countElement) {
            countElement.textContent = bookCount;
        }
    },

    updateUserInfo() {
        const user = UserManager.getCurrentUser();
        if (user) {
            const userNameElements = document.querySelectorAll('#userName, #welcomeUserName');
            userNameElements.forEach(element => {
                element.textContent = user.name || user.username;
            });
        }
    },

    loadUserAvatar() {
        const user = UserManager.getCurrentUser();
        if (user && user.avatar) {
            const avatarImage = document.getElementById('avatarImage');
            const avatarPlaceholder = document.getElementById('avatarPlaceholder');
            
            if (avatarImage && avatarPlaceholder) {
                avatarImage.src = user.avatar;
                avatarImage.classList.remove('hidden');
                avatarPlaceholder.classList.add('hidden');
            }
        }
    }
};

const EventManager = {
    init() {
        this.initLoginForm();
        this.initProfileForm();
        this.initBookActions();
        this.initCategoryFilters();
        this.initImageUpload();
    },

    initLoginForm() {
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                
                const username = document.getElementById('username').value;
                const password = document.getElementById('password').value;
                
                if (username && password) {
                    UserManager.login(username, password);
                    UIManager.showAlert('تم تسجيل الدخول بنجاح!', 'success');
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 1000);
                } else {
                    UIManager.showAlert('يرجى إدخال اسم المستخدم وكلمة المرور', 'danger');
                }
            });
        }
    },

    initProfileForm() {
        const profileForm = document.getElementById('profileForm');
        if (profileForm) {
            profileForm.addEventListener('submit', (e) => {
                e.preventDefault();
                
                const formData = new FormData(profileForm);
                const profileData = Object.fromEntries(formData);
                
                UserManager.updateProfile(profileData);
                UIManager.showAlert('تم حفظ البيانات بنجاح!', 'success');
            });
        }
    },

    initBookActions() {
        document.addEventListener('click', (e) => {
            if (e.target.textContent === 'تجديد') {
                const bookCard = e.target.closest('.book-card');
                const bookId = parseInt(bookCard.dataset.bookId);
                
                UIManager.confirm('هل تريد تجديد هذا الكتاب؟', () => {
                    if (BookManager.renewBook(bookId)) {
                        UIManager.showAlert('تم تجديد الكتاب بنجاح!', 'success');
                        const dueDateElement = bookCard.querySelector('.due-date');
                        if (dueDateElement) {
                            const newDate = new Date();
                            newDate.setDate(newDate.getDate() + 14);
                            dueDateElement.textContent = `مستحق: ${newDate.toLocaleDateString('ar-SA')}`;
                        }
                    }
                });
            }
        });
    },

    initCategoryFilters() {
        const categoryLinks = document.querySelectorAll('.category-list a');
        categoryLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                categoryLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
                
                const categoryId = link.dataset.category || 'all';
                this.filterBooksByCategory(categoryId);
            });
        });
    },

    filterBooksByCategory(categoryId) {
        const books = BookManager.getBorrowedBooks();
        const filteredBooks = categoryId === 'all' 
            ? books 
            : books.filter(book => book.category === categoryId);
        
        this.renderBooks(filteredBooks);
    },

    renderBooks(books) {
        const booksGrid = document.getElementById('booksGrid');
        if (!booksGrid) return;
        
        if (books.length === 0) {
            booksGrid.innerHTML = `
                <div class="no-books">
                    <i class="fas fa-book-open"></i>
                    <h3>لا توجد كتب في هذا التصنيف</h3>
                    <p>جرب تصنيف آخر أو استعر بعض الكتب</p>
                </div>
            `;
            return;
        }
        
        booksGrid.innerHTML = books.map(book => `
            <div class="book-card" data-book-id="${book.id}">
                <div class="book-cover">
                    <i class="${book.cover}"></i>
                </div>
                <h3 class="book-title">${book.title}</h3>
                <p class="book-author">${book.author}</p>
                <div class="book-info">
                    <span class="due-date">مستحق: ${new Date(book.dueDate).toLocaleDateString('ar-SA')}</span>
                </div>
                <div class="book-actions">
                    <button class="btn btn-primary">قراءة</button>
                    <button class="btn btn-secondary">تجديد</button>
                </div>
            </div>
        `).join('');
    },

    initImageUpload() {
        const fileInput = document.getElementById('fileInput');
        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        UserManager.updateProfile({ avatar: e.target.result });
                        UIManager.loadUserAvatar();
                        UIManager.showAlert('تم تحديث الصورة الشخصية!', 'success');
                    };
                    reader.readAsDataURL(file);
                }
            });
        }
    }
};

document.addEventListener('DOMContentLoaded', function() {
    if (!UserManager.isLoggedIn() && !window.location.pathname.includes('login.html')) {
        window.location.href = 'login.html';
        return;
    }
    
    EventManager.init();
    UIManager.updateUserInfo();
    UIManager.loadUserAvatar();
    UIManager.updateBookCount();
    
    if (window.location.pathname.includes('profile.html')) {
        const user = UserManager.getCurrentUser();
        if (user) {
            document.getElementById('fullName').value = user.name || '';
            document.getElementById('email').value = user.email || '';
            document.getElementById('phone').value = user.phone || '';
            document.getElementById('birthDate').value = user.birthDate || '';
            document.getElementById('bio').value = user.bio || '';
            document.getElementById('interests').value = user.interests || '';
            
            if (user.stats) {
                document.getElementById('booksRead').textContent = user.stats.booksRead || 0;
                document.getElementById('currentBooks').textContent = user.stats.currentBooks || 0;
                document.getElementById('readingHours').textContent = user.stats.readingHours || 0;
                document.getElementById('favoriteCategory').textContent = user.stats.favoriteCategory || 'غير محدد';
            }
        }
    }
});

window.UserManager = UserManager;
window.BookManager = BookManager;
window.CategoryManager = CategoryManager;
window.UIManager = UIManager;
window.EventManager = EventManager;
