"use client";

import Link from "next/link";

export default function AdminDishesPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">菜品管理</h1>
          <Link
            href="/admin"
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            返回后台
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="text-center">
            <div className="text-gray-500 mb-4">
              <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h4a1 1 0 011 1v5m-6 0V9a1 1 0 011-1h4a1 1 0 011 1v11" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">菜品管理功能</h2>
            <p className="text-gray-600 mb-6">
              这里可以管理系统中的所有菜品信息，包括添加、编辑和删除菜品。
            </p>
            <div className="space-y-2">
              <Link
                href="/test/dishes"
                className="block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                查看现有菜品管理页面
              </Link>
              <p className="text-sm text-gray-500">
                功能正在完善中，暂时跳转到测试页面
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
