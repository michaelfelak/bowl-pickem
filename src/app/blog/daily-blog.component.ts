import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { BlogEntry } from '../shared/services/bowl.model';
import { BowlService } from '../shared/services/bowl.service';
import * as dayjs from 'dayjs';
import { SettingsService } from '../shared/services/settings.service';
import { AuthService } from '../shared/services/auth.service';
import { SkyRepeaterModule } from '@skyux/lists';

interface ProcessedBlogEntry extends BlogEntry {
  created_date_full?: string;
  safe_body?: SafeHtml;
}

@Component({
  standalone: true,
  selector: 'app-daily-blog',
  imports: [CommonModule, SkyRepeaterModule],
  providers: [SettingsService],
  templateUrl: './daily-blog.component.html',
  styleUrls: ['./daily-blog.component.scss'],
})
export class DailyBlogComponent implements OnInit {
  public blogs: ProcessedBlogEntry[] = [];
  public isLoading = true;
  public isAdmin = false;
  private currentYear: number = 0;

  constructor(
    private svc: BowlService,
    private settings: SettingsService,
    private sanitizer: DomSanitizer,
    private authService: AuthService
  ) {
    // Check if user is admin
    this.isAdmin = this.authService.isAdmin();
  }

  public ngOnInit() {
    this.settings.settings$.subscribe((settings) => {
      this.currentYear = settings.current_year;
      this.loadBlogs();
    });
  }

  private loadBlogs() {
    this.isLoading = true;
    this.svc.getBlogEntries(this.currentYear).subscribe({
      next: (result: BlogEntry[]) => {
        if (result && result.length > 0) {
          // Process and sort blogs by date in descending order
          this.blogs = result
            .map((b: BlogEntry) => {
              const processedBlog: ProcessedBlogEntry = {
                id: b.id,
                body: b.body,
                created_date: dayjs(b.created_date).format('MM/DD/YYYY'),
                created_date_full: b.created_date,
                posted_by: b.posted_by,
                title: b.title,
                year: b.year,
                // Sanitize HTML content to allow proper rendering
                safe_body: this.sanitizer.bypassSecurityTrustHtml(
                  this.formatBlogContent(b.body || '')
                ),
              };
              return processedBlog;
            })
            .sort((a, b) => {
              // Sort by CreatedDateFull in descending order (newest first)
              return (
                dayjs(b.created_date_full).valueOf() -
                dayjs(a.created_date_full).valueOf()
              );
            });
        } else {
          this.blogs = [];
        }
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.blogs = [];
      },
    });
  }

  private formatBlogContent(content: string): string {
    // Convert line breaks to <br> tags and wrap in paragraphs
    if (!content) return '';

    // Split by double newlines to create paragraphs
    const paragraphs = content
      .split(/\n\n+/)
      .map((para) => {
        // Replace single newlines with <br> within paragraphs
        return `<p>${para.replace(/\n/g, '<br>')}</p>`;
      })
      .join('');

    return paragraphs;
  }

  public deleteBlogPost(blogId: string | undefined): void {
    if (
      !blogId ||
      !confirm('Are you sure you want to delete this blog post?')
    ) {
      return;
    }
    this.svc.deleteBlogEntry(blogId).subscribe({
      next: () => {
        this.removeBlogFromList(blogId);
      },
    });
  }

  private removeBlogFromList(blogId: string): void {
    this.blogs = this.blogs.filter((b) => b.id !== blogId);
  }
}
