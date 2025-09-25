"use client";

import Link from "next/link";

export default function AdminCategoriesPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">分类管理</h1>
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">分类管理功能</h2>
            <p className="text-gray-600 mb-6">
              这里可以管理菜品的分类信息，包括添加、编辑和删除分类。
            </p>
            <div className="space-y-2">
              <Link
                href="/test/categories"
                className="block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                查看现有分类管理页面
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
