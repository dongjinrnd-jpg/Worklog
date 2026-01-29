import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';

/**
 * 캐시 무효화 API 라우트
 * 특정 태그의 캐시를 무효화합니다.
 * 
 * @example 
 * POST /api/revalidate?tag=item-data
 * POST /api/revalidate?tags=item-data,projects,managers
 */
export async function POST(request: NextRequest) {
  try {
    // URL에서 tag 파라미터 추출
    const tag = request.nextUrl.searchParams.get('tag');
    const tags = request.nextUrl.searchParams.get('tags');
    
    // 둘 다 없는 경우 에러 반환
    if (!tag && !tags) {
      return NextResponse.json(
        { 
          success: false, 
          message: '무효화할 태그를 지정해주세요. (?tag=태그명 또는 ?tags=태그1,태그2,태그3)' 
        },
        { status: 400 }
      );
    }

    const revalidatedTags: string[] = [];
    
    // 단일 태그 처리
    if (tag) {
      revalidateTag(tag);
      revalidatedTags.push(tag);
    }
    
    // 다중 태그 처리
    if (tags) {
      const tagArray = tags.split(',').map(t => t.trim()).filter(Boolean);
      tagArray.forEach(t => {
        revalidateTag(t);
        revalidatedTags.push(t);
      });
    }
    
    // 성공 응답 반환
    return NextResponse.json({
      success: true,
      message: `${revalidatedTags.join(', ')} 태그의 캐시가 성공적으로 무효화되었습니다.`,
      revalidated: true,
      revalidatedTags
    });
  } catch (error) {
    console.error('캐시 무효화 오류:', error);
    
    // 오류 응답 반환
    return NextResponse.json(
      { 
        success: false, 
        message: '캐시 무효화 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      },
      { status: 500 }
    );
  }
} 