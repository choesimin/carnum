import { NextResponse } from 'next/server'
import db from '@/lib/mongodb'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const database = await db
    
    const review = {
      ...body,
      createdAt: new Date(),
    }
    
    const result = await database.collection('reviews').insertOne(review)
    
    return NextResponse.json({ 
      success: true, 
      message: "리뷰가 저장되었습니다.",
      data: { ...review, _id: result.insertedId }
    })
  } catch (e) {
    console.error('Error in POST /api/reviews:', e)
    return NextResponse.json(
      { success: false, message: "리뷰 저장에 실패했습니다." }, 
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const carNumber = searchParams.get('carNumber')
    
    const database = await db
    
    let query = {}
    if (carNumber) {
      query = {
        carNumber: { $regex: carNumber, $options: 'i' }
      }
    }
    
    const reviews = await database.collection('reviews')
      .find(query)
      .sort({ createdAt: -1 })
      .toArray()

    return NextResponse.json({ 
      success: true, 
      data: reviews 
    })
  } catch (e) {
    console.error('Error in GET /api/reviews:', e)
    return NextResponse.json(
      { success: false, message: "리뷰 검색에 실패했습니다." }, 
      { status: 500 }
    )
  }
}