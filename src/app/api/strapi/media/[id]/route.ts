import { NextRequest, NextResponse } from "next/server";
import { strapiService } from "@/services/strapiService";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json({ error: "Media ID is required" }, { status: 400 });
    }
    
    console.log('🗑️ API: Deleting media file with ID:', id);
    
    // Delete the file from Strapi
    await strapiService.deleteFile(parseInt(id));
    
    console.log('✅ API: Media file deleted successfully');
    
    // Return 204 No Content for successful deletion
    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    console.error("❌ API: Delete media file failed:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete media file" },
      { status: 500 }
    );
  }
}