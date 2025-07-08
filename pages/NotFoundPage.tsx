
import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-slate-100 text-center">
            <h1 className="text-9xl font-black text-blue-300">404</h1>
            <p className="text-2xl font-bold tracking-tight text-slate-800 sm:text-4xl">
                Страница не найдена
            </p>
            <p className="mt-4 text-slate-500">
                К сожалению, мы не смогли найти страницу, которую вы ищете.
            </p>
            <Link
                to="/"
                className="mt-6 inline-block rounded-md bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring"
            >
                Вернуться на главную
            </Link>
        </div>
    );
};

export default NotFoundPage;
