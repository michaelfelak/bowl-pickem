import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { BowlService } from '../../shared/services/bowl.service';
import { SettingsService } from '../../shared/services/settings.service';
import { BlogEntry } from '../../shared/services/bowl.model';

@Component({
  standalone: true,
  selector: 'app-add-blog',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './add-blog.component.html',
  styleUrls: ['./add-blog.component.scss'],
})
export class AddBlogComponent implements OnInit {
  public blogForm!: FormGroup;
  public isSubmitting = false;
  public successMessage = '';
  public errorMessage = '';

  private currentYear: number = 0;

  constructor(
    private fb: FormBuilder,
    private bowlService: BowlService,
    private settings: SettingsService
  ) {
    this.settings.settings$.subscribe((settings) => {
      this.currentYear = settings.current_year;
    });
  }

  public ngOnInit() {
    this.initializeForm();
  }

  private initializeForm() {
    this.blogForm = this.fb.group({
      title: [''],
      body: ['', [Validators.required, Validators.minLength(10)]],
      postedBy: ['', Validators.required],
    });
  }

  public submitBlog() {
    if (this.blogForm.invalid) {
      this.errorMessage =
        'Please fill in all required fields and ensure the blog content is at least 10 characters.';
      return;
    }

    this.isSubmitting = true;
    this.successMessage = '';
    this.errorMessage = '';

    const blogEntry: BlogEntry = {
      title: this.blogForm.get('title')?.value || 'Blog Entry',
      body: this.blogForm.get('body')?.value,
      posted_by: this.blogForm.get('postedBy')?.value,
      created_date: new Date().toISOString(),
      id: '', // Will be assigned by backend
    };

    this.bowlService.addBlogEntry(blogEntry, this.currentYear).subscribe({
      next: (response: BlogEntry) => {
        this.isSubmitting = false;
        this.successMessage = 'Blog entry posted successfully!';
        this.blogForm.reset();
        setTimeout(() => {
          this.successMessage = '';
        }, 5000);
      },
      error: (error) => {
        this.isSubmitting = false;
        this.errorMessage = 'Failed to post blog entry. Please try again.';
        console.error('Error posting blog:', error);
      },
    });
  }

  public resetForm() {
    this.blogForm.reset();
    this.successMessage = '';
    this.errorMessage = '';
  }
}
