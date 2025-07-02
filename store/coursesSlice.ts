import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Course {
    _id: string;
    title: string;
    description: string;
    thumbnail: string;
    isPaid: boolean;
    price: number;
    slug: string;
    instructorId: {
        name: string;
    };
    categoryId: {
        name: string;
    };
}

export interface Category {
    _id: string;
    name: string;
}

interface CoursesState {
    courses: Course[];
    categories: Category[];
    loading: boolean;
    searchTerm: string;
    selectedCategory: string;
    courseType: string;
}

const initialState: CoursesState = {
    courses: [],
    categories: [],
    loading: true,
    searchTerm: '',
    selectedCategory: 'all',
    courseType: 'all',
};

export const fetchCategories = createAsyncThunk('courses/fetchCategories', async () => {
    const response = await fetch('/api/categories');
    const data = await response.json();
    return data.categories as Category[];
});

export const fetchCourses = createAsyncThunk<
    Course[],
    void,
    { state: { courses: CoursesState } }
>('courses/fetchCourses', async (_, { getState }) => {
    const { selectedCategory, courseType } = getState().courses;
    const params = new URLSearchParams();
    if (selectedCategory !== 'all') params.append('category', selectedCategory);
    if (courseType !== 'all') params.append('type', courseType);
    const response = await fetch(`/api/courses?${params.toString()}`);
    const data = await response.json();
    return data.courses as Course[];
});

const coursesSlice = createSlice({
    name: 'courses',
    initialState,
    reducers: {
        setSearchTerm(state, action: PayloadAction<string>) {
            state.searchTerm = action.payload;
        },
        setSelectedCategory(state, action: PayloadAction<string>) {
            state.selectedCategory = action.payload;
        },
        setCourseType(state, action: PayloadAction<string>) {
            state.courseType = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchCategories.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchCategories.fulfilled, (state, action) => {
                state.categories = action.payload;
                state.loading = false;
            })
            .addCase(fetchCategories.rejected, (state) => {
                state.loading = false;
            })
            .addCase(fetchCourses.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchCourses.fulfilled, (state, action) => {
                state.courses = action.payload;
                state.loading = false;
            })
            .addCase(fetchCourses.rejected, (state) => {
                state.loading = false;
            });
    },
});

export const { setSearchTerm, setSelectedCategory, setCourseType } = coursesSlice.actions;
export default coursesSlice.reducer;
